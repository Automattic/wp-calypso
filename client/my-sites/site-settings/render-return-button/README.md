Back button
===========

This component is used to display Back button used for site redirection.

#Usage:

``js
import ReturnToPreviousPage from 'my-sites/site-settings/render-return-button/back';

handleClickBack() => {
...
}

<span className="....">
		<ReturnToPreviousPage onBackClick={ this.handleClickBack } { ...this.props } />
</span>

#Props:

- `handleClickBack()` function to handle onClick event
