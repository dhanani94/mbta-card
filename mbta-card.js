class MBTACard extends HTMLElement {
    set hass(hass) {
        const icon_path = this.config.icon;
        if (!this.content) {
            const card = document.createElement('ha-card');
            card.header = name;
            this.content = document.createElement('div');
            const style = document.createElement('style');
            style.textContent = `
        table {
            width: 100%;
            padding: 6px 14px;
            font-family: 'Roboto';
        }

        td {
            padding: 3px 0px;
        }

        td.shrink {
            white-space: nowrap;
        }

        td.expand {
            width: 99%
        }

        span.line {
            padding: 15px 1px 2px 4px;
            margin-left: 0.2em;
            margin-right: 0.2em;
            border-radius: 999px;
        }

        span.red {
            background-color: #da291c;
        }

        span.orange {
            background-color: #ed8b00;
        }

        span.green {
            background-color: #00843d;
        }

        span.blue {
            background-color: #003da5;
        }`;
            card.appendChild(style);
            card.appendChild(this.content);
            this.appendChild(card);
        }
        let tablehtml = `\n<table>`;
        this.config.entities.forEach(function (entity_dict) {
            let sensor = hass.states[entity_dict["entity"]];
            let offset_minutes = entity_dict["offset_minutes"];
            let limit = entity_dict["limit"];
            let attr = sensor["attributes"];
            let direction = attr['direction'];
            let route = attr['route'].toLowerCase();
            let stop = attr['stop'];
            let state = sensor['state'];
            state = state.replace("[", "");
            state = state.replace("]", "");
            state = state.replace(new RegExp("'", 'g'), "");
            state = state.replace(new RegExp('"', 'g'), "");
            state = state.split(",");
            let counter = 0;
            state.forEach(function (eta_str) {
                let minutes = eta_str.includes("m ") ? parseInt(eta_str.split("m ")[0]) : 0;
                if (counter < limit && minutes >= offset_minutes) {
                    tablehtml += `
                                <tr>
                                    <td class="shrink" style="text-align:center;"><img width="20px" src="${icon_path}">
                                        <span class="line ${route}"></span>
                                    </td>
                                    <td class="expand">${stop} to ${direction}</td>
                                    <td class="shrink" style="text-align:right;">${eta_str}</td>
                                </tr>
                            `;
                    counter++;
                }
            });


        });

        tablehtml += `</table>`;

        this.content.innerHTML = tablehtml
    }

    setConfig(config) {
        if (!config.entities) {
            throw new Error('You need to define at least one entity');
        }
        this.config = config;
    }

    getCardSize() {
        return 1;
    }
}

customElements.define('mbta-card', MBTACard);