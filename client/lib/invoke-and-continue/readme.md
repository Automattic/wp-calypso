# invokeAndContinue

A utility for calling functions during a promise.then chain without interupting data flow.

## Usage

Allows us to avoid the following pattern:

```js
const callSomeSideEffect = data => {
	someSideEffect();

	return data;
};

someRequest
	.then( parseData )
	.then( callSomeSideEffect )
	.then( doSomethingWithTheData );
```

And instead just do:

```js
import invokeAndContinue from 'lib/invoke-and-continue';

someRequest
	.then( parseData )
	.then( invokeAndContinue( someSideEffect ) )
	.then( doSomethingWithTheData );
```
