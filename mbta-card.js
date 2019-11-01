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
        }

        span.commuter {
            background-color: #80276c;
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
            let depart_from = attr['depart_from'];
            let arrive_at = attr['arrive_at'];
            let route = attr['route'].toLowerCase();
            let css_route = (["red", "orange", "green", "blue"].includes(route)) ? route : "commuter";

            let stop_array = []
            stop_array.push([sensor['state'], attr['delay']])
            JSON.parse(attr['upcoming_departures']).forEach(upcoming => {
                stop_array.push([upcoming['departure'], upcoming['delay']])
            });

            let counter = 0;
            stop_array.forEach(function (stop) {
                let [eta_str, delay_str] = stop;
                let minutes = eta_str.includes("m ") ? parseInt(eta_str.split("m ")[0]) : 0;
                if (counter < limit && minutes >= offset_minutes) {
                    tablehtml += `
                                <tr>
                                    <td class="shrink" style="text-align:center;"><img width="20px" src="${icon_path}">
                                        <span class="line ${css_route}"></span>
                                    </td>
                                    <td class="expand">${depart_from} to ${arrive_at}</td>
                                    <td class="shrink" style="text-align:right;">${eta_str} ${(delay_str !== null) ? `(${delay_str} delayed)` : ``} </td>
                                    </tr>`;
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
