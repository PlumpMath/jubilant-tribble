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
var context = cubism.context()
    .serverDelay(5 * 60 * 1000)
    .step(1 * 60 * 1000)
    .size(530);

var graphite = context.graphite("http://graphite.aws-us-west-2-staging.socrata.net");

function get_title(metric) {
    return metric.split(".").slice(2).join(".").replace(")", "");
}

function append_title(title) {
    div = d3.select("body").select("#metrics-bar").append("div")
    div.data([graphite.metric()])
        .attr("class", "horizon")
        .call(context.horizon());
    div.select(".title")[0][0].innerHTML = title;
}

function clear_metrics() {
    d3.select("#metrics-bar")[0][0].innerHTML = "";
}

function set_metrics(metrics) {
    /* Titles assume metrics are clustered by metric */

    clear_metrics();

    section_titles = [];
    new Set(metrics.map(function(cur, i, a){return get_title(cur)})).forEach(function(cur, i, a) {
        section_titles.push(cur);
    });

    d3.select("body").select("#metrics-bar").selectAll(".axis")
        .data(["top", "bottom"])
        .enter().append("div")
        .attr("class", function(d) { return d + " axis"; })
        .each(function(d) { d3.select(this).call(context.axis().ticks(8).orient(d)); });

    cur_title = 0;
    append_title(section_titles[cur_title]);
    for (var i=0, len=metrics.length; i < len; i++) {
        if (get_title(metrics[i]) != section_titles[cur_title]) {
            if (cur_title < section_titles.length) {
                cur_title += 1;
                append_title(section_titles[cur_title]);
            }
        }

        div = d3.select("body").select("#metrics-bar").append("div")
        div.data([graphite.metric(metrics[i])])
            .attr("class", "horizon")
            .call(context.horizon());
        div.select(".title")[0][0].innerHTML = metrics[i].split(".")[1];
    }

    d3.select("body").select("#metrics-bar")
        .append("div")
        .attr("class", "rule")
        .call(context.rule());

    context.on("focus", function(i) {
        d3.selectAll(".value").style("right", i == null ? null : context.size() - i + "px");
    });
}

function generate_metrics(metrics) {
    calls = [];
    for (var i=0, len=metrics.length; i<len; i++) {
        (function() {
            var metric = metrics[i];

            calls.push(
                new Promise(function(resolve, reject) {
                    if (Array.isArray(metric)) {
                        m = metric[0];
                    } else {
                        m = metric;
                    }

                    graphite.find(m, function(err, res) {resolve(res);});

                }).then(function(data) {
                    if (Array.isArray(metric)) {
                        return data.map(function(cur, i, a) {
                            s = "";
                            for (var k=metric.length-1; k>0; k--) {
                                s = metric[k] + "(" + cur + ")";
                            }
                            return s;
                        });
                    } else {
                        return data;
                    }
                })
            );
        }());
    }
    return Promise.all(calls).then(function(data) {
        return [].concat.apply([], data);
    });
}

function random(x) {
    var value = 0,
        values = [],
        i = 0,
        last;
    return context.metric(function(start, stop, step, callback) {
        start = +start, stop = +stop;
        if (isNaN(last)) last = start;
        while (last < stop) {
            last += step;
            value = Math.max(-10, Math.min(10, value + .8 * Math.random() - .4 + .2 * Math.cos(i += x * .02)));
            values.push(value);
        }
        callback(null, values = values.slice((start - stop) / step));
    }, x);
}
