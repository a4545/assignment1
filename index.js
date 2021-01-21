var express = require('express');
var app = express();
// for parsing the body in POST request
var bodyParser = require('body-parser');

var usage =[];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.post('/api/usage', async function (request, response) {
var input = request.body;
console.log(input);
const toPairs2 = (xs) => 
xs .length == 0 ? [] : [xs .slice (0, 2), ... toPairs2 (xs .slice (2))]

const date2iso = (date) =>
date .toISOString() .slice (0, 10)

const iso2date = (iso, [y, m, d] = iso.split('-')) =>
new Date (y, m - 1, d, 12)  // use noon to avoid summertime hour issues

const nextDay = (iso, d = iso2date (iso)) => 
date2iso (d .setDate (d .getDate () + 1) && d)

const prevDay = (iso, d = iso2date (iso)) => 
date2iso (d .setDate (d .getDate () - 1) && d)

const countDays = (start, stop) => 
start > stop ? 0 : 1 + countDays (nextDay(start), stop)

const monthEnd = (d) => {
const date = iso2date (d)
date .setMonth (date.getMonth() + 1)
date .setDate (0)
return date2iso (date)
}

const splitByMonth = (start, stop, me = monthEnd (start)) =>
start .slice (0, 7) >= stop .slice (0, 7)
  ? [{start, stop}]
  : [{start, stop: me}, ... splitByMonth (nextDay (me), stop)]


// main function
const makeBill = (plans, data) => {
return toPairs2 (input) .map (
  ([{date: start, plan}, {date: stop}]) => ({plan, start, stop})
) .map (
  ({plan, start, stop}, i, a) => ({
    plan,
    start: a .find (({plan: p, stop: s}) => s == start && plans[p] > plans[plan]) ? nextDay(start) : start,
    stop: a .find (({plan: p, start: s}) => s == stop && plans[p] > plans[plan]) ? prevDay(stop) : stop
  })
) .flatMap (
  ({plan, start, stop}) => splitByMonth (start, stop) .map (
    ({start, stop}) => ({start, stop, plan})
  )
) .map (
  ({plan, start, stop}) => ({plan, stop, start, count: countDays(start, stop)})
) .map (
  ({plan, count, ...rest}) => ({...rest, plan, amount: count * plans[plan]})
)
}
const plans = {bronze: 10, silver: 20, gold: 30}
//const input = [{date: '2020-01-01', plan: 'gold', action: 'start'}, {date: '2020-01-10', plan: 'gold', action: 'stop'}, {date: '2020-01-15', plan: 'silver', action: 'start'}, {date: '2020-01-21', plan: 'silver', action: 'stop'}, {date: '2020-01-21', plan: 'bronze', action: 'start'}, {date: '2020-03-01', plan: 'bronze', action: 'stop'}, {date: '2020-03-01', plan: 'silver', action: 'start'}, {date: '2020-03-10', plan: 'silver', action: 'stop'}, {date: '2020-03-11', plan: 'gold', action: 'start'}, {date: '2020-03-20', plan: 'gold', action: 'stop'},]
// let bill =[];
// bill.push();
return response.send(makeBill (plans, input));
});

app.listen('3000', function(){
    console.log('Server listening on port 3000');
});