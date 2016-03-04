/**
 * External Dependencies
 */
import React, { Component } from 'react';

/**
 * Internal Dependencies
 */
import FormCheckbox from 'components/forms/form-checkbox';
import i18n from 'lib/mixins/i18n'

class EnableLocaleCheckbox extends Component {

	constructor( props ) {
		super( props );

		this.state = {
			checked: false
		};
	}

	componentDidMount() {
		const checkCurrentLocale = this.checkCurrentLocale.bind( this );

		i18n.on( 'change', checkCurrentLocale );

		// Tidy up the event when done
		this.componentWillUnmount = () => i18n.off( 'change', checkCurrentLocale );

		checkCurrentLocale();
	}

	onClick() {
		if ( this.state.checked ) {
			i18n.setLocaleSlug( this.props.defaultLocaleSlug );
		} else {
			i18n.setLocaleSlug( this.props.userLocaleSlug );
		}
	}

	checkCurrentLocale() {
		this.setState( {
			checked: ( i18n.getLocaleSlug() === this.props.userLocaleSlug )
		} );
	}

	render() {
		const onClick = this.onClick.bind( this );

		return (
			<FormCheckbox checked={ this.state.checked } onClick={ onClick } />
		);
	}
}
EnableLocaleCheckbox.defaultProps = {
	defaultLocaleSlug: 'en',
	userLocaleSlug: 'en'
}

export default EnableLocaleCheckbox;
