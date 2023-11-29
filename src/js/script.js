'use strict';

window.addEventListener('DOMContentLoaded', () => {

    const form = document.querySelector('.form__form-box'), 
          inputs = document.querySelectorAll('.form__input');    

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formDataObj = Object.fromEntries(new FormData(e.target).entries());
        
        if(!isValid(formDataObj)) {
            failureAuth('Логин и пароль должны быть заполнены');
            setDefaultForm();
            return ;
        }

        disableForm();

        showLoader('form__loader', 'icons/form/ring-resize.svg', 'afterend');
        
        getData('https://test-works.pr-uni.ru/api/login', formDataObj)
            .then(data => data.json())
            .then(data => {
                data.status === 'ok' ? successAuth(data) : failureAuth(data.errorMessage);
            })
            .catch(err => console.log(err))
            .finally(() => {
                undisableForm();
                removeElement('.form__loader');
                setDefaultForm();
            });
    });

    function isValid(data) {
        return (data.login !== "" || data.password !== "");
        
    }

    function disableForm() {
        document.querySelector('fieldset').disabled = true;
        document.querySelector('.button').disabled = true;
    }

    function undisableForm() {
        document.querySelector('fieldset').disabled = false;
        document.querySelector('.button').disabled = false;
    }

    function showErrorMessage(
        text, 
        className = 'form__error', 
        adjacentElemSelector = '.form__button', 
        position = 'beforebegin'
        ) {
        const errorElem = document.querySelector(`.${className}`)
        if (errorElem) {
            error.textContent = text;
            return;
        }

        const errorMessage = document.createElement('div');
        errorMessage.classList.add(className);
        errorMessage.textContent = text;
        document
            .querySelector(adjacentElemSelector)
            .insertAdjacentElement(position, errorMessage);
    }
       
    function removeElement(selector) {
        document.querySelector(selector)?.remove();
    }
    
    function showLoader(className, src, position) {
        const loadingImg = document.createElement('img');
        loadingImg.src = src;
        loadingImg.classList.add(className); 

        form.insertAdjacentElement(position, loadingImg);
    } 

    async function getData(url, params) {
        url = url + '?' + stringifyParams(params);

        const result = await fetch(url);

        if (!result.ok) {
            throw Error(result.statusText);
        }

        return await result;
    };

    function stringifyParams(obj) {
        return Object.keys(obj)
            .filter(key => obj[key])
            .map(key => key + '=' + encodeURIComponent(obj[key]))
            .join('&');
    }

    function successAuth(data) {
        const time = {
            second: 1000,
            minute: 60 * 1000,
            hour: 60 * 60 * 1000,
            day: 24 * 60 * 60 * 1000
        }
        const date = new Date(Date.now() + 30 * time.day);
        setCookie('token', data.token, {secure: true, expires: date, samesite: 'lax'})
        
        inputs.forEach(input => input.classList.add('form__input-success'));
        const message = `${data.user.name}, Вы успешно авторизованы!`; 
        showSuccessMessage('form__success', '.form__wrapper', '.form', message, 2000);
    }

    function showSuccessMessage(className, sectionHideSelector, wrapperSelector, message, time) {
        const section = document.querySelector(`${sectionHideSelector}`);
        section.classList.add('hide');
    
        const successMessage = document.createElement('div');
        successMessage.classList.add(className);
        successMessage.textContent = message;
    
        document.querySelector(wrapperSelector).append(successMessage);
    
        setTimeout(() => {
            successMessage.remove();
            section.classList.remove('hide');
        }, time);
    }

    function failureAuth(message) {
        showErrorMessage(message);
        inputs.forEach(input => input.classList.add('form__input-error'));
    }

    function setDefaultForm() {
        inputs.forEach(input => input.addEventListener('input', () => {
                inputs.forEach(input => input.className = 'form__input');
                removeElement('.form__error');
            }, { once: true })
        );
    }

    function setCookie(name, value, options = {}) {
        options = {
          path: '/',
          ...options
        };
      
        if (options.expires instanceof Date) {
          options.expires = options.expires.toUTCString();
        }
      
        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
      
        for (let optionKey in options) {
          updatedCookie += "; " + optionKey;
          let optionValue = options[optionKey];
          if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
          }
        }
      
        document.cookie = updatedCookie;
    }
});