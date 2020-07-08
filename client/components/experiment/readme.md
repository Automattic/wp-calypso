# Experiment Component

A component for wrapping experiment variations and making the variations easier to reason about.
You can use this component as a reference implementation in your own component or simply use this
component to take advantage of current and future best-practices.

Usage:

```jsx
function SomeExperiment(props) {
    import React from 'react';
    import Experiment, {DefaultVariation, Variation, LoadingVariations} from "client/components/experiment";
    return (<Experiment name={'experiment_name'}>
    <DefaultVariation name='A'>
        Shows this variation when:
        <ol>
            <li>The user doesn't have a variation assigned to them.</li>
            <li>The experiment doesn't exist.</li>
            <li>Before the experiment goes live</li>
        <ol>
    </DefaultVariation>
    <Variation name='B'>
        Show variation B if the user is assigned this variation.
    </Variation>
    <LoadingVariations>
        Show this when we don't know the variation because we haven't called the API yet to get variations.
        <br>
        Protip: If this experiment is in the middle or end of a flow, try putting 
        <code>&lt;QueryExperiments&gt;</code> at the beginning of your flow to ensure the variation 
        assignments are preloaded.
    </LoadingVariations>
</Experiment>);
}
```
