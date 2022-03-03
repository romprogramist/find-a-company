class FindACompany extends HTMLElement {
    connectedCallback() {
        const url = this.getAttribute('url');
        const token = this.getAttribute('token');

        const shadow = this.attachShadow({mode: 'open'});
        const form = document.createElement('form');

        const UIData = JSON.parse(this.getAttribute('ui-data-json'));
        
        UIData.forEach((el, index) => {
            const label = document.createElement('label');
            label.classList.add('form-label');
            label.textContent = `${el.label}`;

            const wrapper = document.createElement('div');
            wrapper.classList.add('wrapper')

            const input = document.createElement('input', {});
            input.setAttribute('type', 'text');            
            input.setAttribute('class', `form-control ${ index !== 0 ? el.fieldNames.reduce((acc, curr, index) => acc += (index !== 0 ? '-' : '') + curr.split('.').join('_'), '') : 'general'}`); 

            wrapper.appendChild(label);
            wrapper.appendChild(input); 

            if (index === 0) {
                
                input.setAttribute('list', 'character');
                const nestedDiv = document.createElement('div');
                nestedDiv.classList.add('form-text');
                nestedDiv.textContent = 'Организация (LEGAL)';
                const datalist = document.createElement('datalist');
                datalist.setAttribute('id', 'character');
                wrapper.appendChild(datalist);
                wrapper.appendChild(nestedDiv);  
                
                input.addEventListener('input', () => {
                    let query = input.value;
                    let options = {
                        method: "POST",
                        mode: "cors",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json",
                            "Authorization": "Token " + token
                        },
                        body: JSON.stringify({query: query})
                    }
                    fetch(url, options)
                    .then(response => response.json())
                    .then(result => {
                        datalist.innerHTML = '';
                        if (!result || !result.suggestions) {
                            return;
                        }
                        const fragment = document.createDocumentFragment();
                        result.suggestions.forEach(el => {
                            fragment.appendChild(document.createElement('option')).setAttribute('value', el.value)                   
                        })
                        datalist.appendChild(fragment);
                        input.dataset.info = JSON.stringify(result);          
                    })
                    .catch(error => console.log("error", error));
                });

                input.addEventListener('change', () => { 
                    const selected = JSON.parse(input.dataset.info).suggestions.find(s => s.value === input.value);
                    UIData.forEach(el => {
                        if(el.fieldNames) {
                            const inputClass = el.fieldNames.reduce((acc, curr, index) => acc += (index !== 0 ? '-' : '') + curr.split('.').join('_'), '');
                            const value = el.fieldNames.reduce((acc, curr, index) => acc += (index !== 0 ? ' / ' : '') + (curr.split('.').reduce((acc, curr) => acc[curr], selected) ?? '-'), '');;
                            this.shadowRoot.querySelector(`.${inputClass}`).value = value ?? '-';
                        }
                    });
                    this.shadowRoot.querySelector(`.general`).blur();
                });
            }

            form.appendChild(wrapper);
        });

        const style = document.createElement('style');
        style.textContent = `
            .general::-webkit-calendar-picker-indicator {
                opacity: 0
            }
            datalist {
                display: none;
            }
            form {
                padding: 50px 0;     
                background: #f3f3f3;    
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .wrapper {
                display: flex;
                flex-direction: column;
                width: 85%;
                margin-top: 20px;                
            }
            .form-text {
                padding-left: 15px;
                margin-top: 5px;
            }
            input {
                padding-left: 15px;
                height: 38px;
                margin-top: 5px;
                outline: none;
                border: none;
                border-radius: 5px;
            }
            label {
                padding-left: 15px;
            }
        `;

        shadow.appendChild(style);
        shadow.appendChild(form);
    }
}

customElements.define("find-a-company", FindACompany);