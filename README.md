# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment


This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



workflow


1. For admin user - auto recognize - unlimited premium
	- admin dashboard only( task should go to pages not only on one page)
	- auto fetching/polling of mails should start
	- if any mail has more than 1 task all should be created with full summary/description, task title, priority time, accept/reject (from clicking title we can edit task and see exact mail time zone, attachments everything there)

then when task created as user rejects - mail to sender with rejection or busy with alternative time slots plus message to mail again with new time. or we can change the time of schedule before accept task then mail goes to sender with that time.

now when we accept - check if time mentioned in mail then check if that time is before current time or not if after current time and slot is free of that mentioned time schedule at that time.
	- if time before current reject and send mail to sender for revising the time.
	- if slot mentioned in mail is not free put it in free schedule and send mail to sender.
	- if no time mentioned make in next free schedule of our time table and send mail to sender.
	- check for meeting link if in mail fetch that and attach that in calendar task if not there in mail create one add to task in calendar and then send to sender.

Now Calendar part  - connected to google calendar and should look exactly that and as soon as task clicked completed task should be removed from calendar.
	- task should be strictly not go to previous time which is completed
	- and from here when we click on task title we should get a reschedule button should get a choice of manually add time or by ai to next free slot and as soon we do this previous created task should be deleted and shifted to new rescheduled one.
	- and sender should receive mail regarding same.
	- if task is of not meeting/discussion or not anything of creation g meet for that no meeting should be generated or attached in calendar only task and google calendar not meet link with minimal time or common time frame and user from dashboard can adjust it.
	- a button to go to calendar google one 
	- a button to go to meet link from our calendar.

now dashboard as soon as time of meeting ends we click on complete to completed task mail goes to sender now unapproved or incompleted task should come up and we having that all task, approved, and all etc.

if any action not taken for created task not approved neither rejected reminder mail should come to user

task priority is important
if in mail specific time frame is there 10 min , 15min that should be used for meeting or task creation otherwise fixed one in settings.

now settings page - days of working
	- timing hours
	- lunch break or any other break want to add
	- buffer time 
	- not available time
	- meeting time
	- all should be flexible to modify not only in 10min 15 min 20min option can be adjusted by user

now polling should be done for last 12 hours 'unread' mails only and should send 6-8 mails at time to our llm for checking if it is having a task and then if task is there it should be created on dashboard 
	- if a mail having multiple tasks it should identify them as it is either it should create individual tasks of all the tasks from mail or it should put them as subtasks on one major task if possible this way other wise single for every task 
	- tasks should be fetched with full accuracy
	- manual poll button and inject button to inject tasks
it should remember task from whom it came everything coz in future any modification to that task mail comes it should know or remember about which task this mail is related to (eg meeting with Rahul at 11 am task generated and further after 1 hour another mail comes to push Rahul with 1 hour) previous mail or task and then it should push reschedule to calendar accordingly basically context should be known.



