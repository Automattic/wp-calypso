/**
 * External dependencies
 */
import classNames from 'classnames';
import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import LanguagePicker from 'components/language-picker';
import config from 'config';

class LanguagePickerExample extends PureComponent {
	static displayName = 'LanguagePickerExample';

	state = {
		disabled: false,
		loading: false,
		language: 'en'
	}

	selectLanguage = ( event ) => {
		this.setState( { language: event.target.value } );
	}

	toggleDisabled = () => {
		this.setState( { disabled: ! this.state.disabled } );
	}

	triggerLoading = () => {
		if ( ! this.state.loading ) {
			this.setState( { loading: true } );
			setTimeout( () => this.setState( { loading: false } ), 2000 );
		}
	}

	render() {
		const { disabled, loading, language } = this.state;

		const loadingCls = classNames( 'docs__design-toggle button', {
			'is-busy': loading
		} );

		return (
			<div>
				<a className="docs__design-toggle button" onClick={ this.toggleDisabled }>
					{ disabled ? 'Enabled State' : 'Disabled State' }
				</a>
				<a
					className={ loadingCls }
					style={ { marginRight: '8px' } }
					onClick={ this.triggerLoading }
				>Test Loading</a>
				<Card>
					<LanguagePicker
						languages={ config( 'languages' ) }
						valueKey="langSlug"
						value={ loading ? null : language }
						onChange={ this.selectLanguage }
						disabled={ disabled }
					/>
				</Card>
			</div>
		);
	}
}

export default LanguagePickerExample;
