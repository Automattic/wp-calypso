# Directly state

[Directly's](https://www.directly.com/) Real Time Messaging (RTM) widget is an on-demand
customer support tool. Read more about the RTM widget and how it's used in Calypso in the
[`lib/directly` README](../../../../lib/directly/README.md).

## Action Creators

These action creators return simple actions. The RTM API is called from the
[data-layer](../../data-layer/third-party/directly/README.md) when these actions
are intercepted in middleware.

- `initialize()`
- `askQuestion( questionText, name, email )`
