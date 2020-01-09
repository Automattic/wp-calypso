# Experiment Component

A handy helper component for experiments!

Usage:

```jsx harmony
function SomeExperiment(props) {
    return (<Experiment name={'experiment_name'}>
    <DefaultVariation name=A>
        Show this variation, even if the user isn't assigned to this test.
    </DefaultVariation>
    <Variation name=B>
        Show variation B if the user is assigned this variation.
    </Variation>
    <LoadingVariations>
        Show this if the user hasn't been assigned a variation yet and we need to call the API.    
    </LoadingVariations>
</Experiment>);
}
```
