//
// Copyright 2016 Matt Shanker
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
var cy = cytoscape({
    container: document.getElementById("dashboard-diagram"),

    elements: [
        {data: {id: 'nginx-fe',  label: 'Web Server',
                metrics: ['nginx.*.active_connections',
                          ['nginx.*.requests', 'derivative']]}},
        {data: {id: 'ats',       label: 'ATS'}},
        {data: {id: 'backend',   label: 'Backend'}},
        {data: {id: 'approuter', label: 'App Router'}},

        {data: {source: 'nginx-fe',  target: 'ats'}},
        {data: {source: 'ats',       target: 'backend'}},
        {data: {source: 'backend',   target: 'approuter'}},
        {data: {source: 'approuter', target: 'backend'}}
    ],

    style: [
        {
            selector: 'node',
            style: {
                'background-color': '#666',
                'label': 'data(label)'
            }
        },

        {
            selector: 'edge',
            style: {
                'width': 3,
                'line-color': '#ccc',
                'target-arrow-color': '#ccc',
                'target-arrow-shape': 'triangle'
            }
        }
    ],

    layout: {
        name: 'breadthfirst',
        directed: true,
    }

});

cy.on('tap', 'node', function(evt) {
    var node = evt.cyTarget;
    generate_metrics(node.data("metrics")).then(set_metrics);
});
