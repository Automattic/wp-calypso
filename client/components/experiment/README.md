# Experiment Component

A handy helper component for experiments!

Usage:

```jsx harmony
function SomeExperiment(props) {
    return (<Experiment name={'experiment_name'}>
    <Experiment.Default name=A>
        Show the default variation.
    </Experiment.Default>
    <Experiment.Variation name=B>
        Show variation B
    </Experiment.Variation>
</Experiment>);
}
```
