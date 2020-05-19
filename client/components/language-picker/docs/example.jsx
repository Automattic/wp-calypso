/**
 * External dependencies
 */

import React, { PureComponent } from 'react';

/**
 * Internal dependencies
 */
import { languages } from 'languages';
import LanguagePicker from 'components/language-picker';
import { Card, Button } from '@automattic/components';

class LanguagePickerExample extends PureComponent {
	static displayName = 'LanguagePickerExample';

	state = {
		disabled: false,
		loading: false,
		language: 'en',
	};

	selectLanguage = ( event ) => {
		this.setState( { language: event.target.value } );
	};

	toggleDisabled = () => {
		this.setState( { disabled: ! this.state.disabled } );
	};

	triggerLoading = () => {
		if ( ! this.state.loading ) {
			this.setState( { loading: true } );
			setTimeout( () => this.setState( { loading: false } ), 2000 );
		}
	};

	render() {
		const { disabled, loading, language } = this.state;

		return (
			<div>
				<div className="docs__design-toggle">
					<Button onClick={ this.toggleDisabled }>
						{ disabled ? 'Enabled State' : 'Disabled State' }
					</Button>
					<Button busy={ loading } style={ { marginLeft: '8px' } } onClick={ this.triggerLoading }>
						Test Loading
					</Button>
				</div>
				<Card>
					<LanguagePicker
						languages={ languages }
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
