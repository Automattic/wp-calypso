Periodic Actions Middleware
===========================

There are situations where we require a redux action to be executed from time to time, e.g: a fetch action to implement data-polling.

This middleware implements functionality to allow periodic dispatching of any redux action. That is accomplished by intercepting two redux actions PERIODIC_ACTION_SUBSCRIBE, PERIODIC_ACTION_UNSUBSCRIBE.

### Periodic action subscribe

Periodic action subscribe, signals that the dispatcher of the action requires a given action to be executed periodically.

The action contains the periodic action to be executed and some properties that configure its execution, e.g. interval between executions.

The way the periodicActionId is generated should ensure that if two periodic actions are the same, their ids should be the same and if the actions are different their ids should be different. It is recommended that the id’s passed should be based on the properties necessary to build the periodic action e.g if the periodic action is fetchSite a possible id is  fetchSite-{siteId}. The id allows the middleware to check if the periodic action already exists and if yes the middleware does not need to create a new one avoiding duplicate/unnecessary repetition of periodic actions.

### Periodic action unsubscribe

The periodic action unsubscribe signals that the dispatcher is not interested anymore in the execution of a periodic action.

The unsubscribe does not guarantee that the periodic action will stop being executed. If other artifacts are still interested in the periodic action, the execution continues. It only stops when no more artifacts require the periodic execution of the action.

The artifacts that subscribe a periodic action should unsubscribe when they no longer need it. 
