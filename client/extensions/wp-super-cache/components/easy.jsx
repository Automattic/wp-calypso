/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormRadio from 'components/forms/form-radio';
import SectionHeader from 'components/section-header';

class Easy extends Component {
	state = {
		checkedRadio: 'off',
	};

	handleRadioChange = event => this.setState( { checkedRadio: event.currentTarget.value } );

	render() {
		const { translate } = this.props;
		const { checkedRadio } = this.state;

		return (
			<div>
				<SectionHeader label={ translate( 'Caching' ) }>
					<Button
						compact={ true }
						primary={ true }
						type="submit">
							{ translate( 'Update Status' ) }
					</Button>
				</SectionHeader>
				<Card>
					<form>
						<FormFieldset>
							<FormLabel>
								<FormRadio value="on" checked={ 'on' === checkedRadio } onChange={ this.handleRadioChange } />
								<span>
									{ translate(
										'Caching On {{em}}(Recommended){{/em}}',
										{
											components: { em: <em /> }
										}
									) }
								</span>
							</FormLabel>

							<FormLabel>
								<FormRadio value="off" checked={ 'off' === checkedRadio } onChange={ this.handleRadioChange } />
								<span>{ translate( 'Caching Off' ) }</span>
							</FormLabel>
						</FormFieldset>
					</form>
				</Card>

				<SectionHeader label={ translate( 'Delete Cached Pages' ) } />
				<Card>
					<p>
						{ translate(
						'Cached pages are stored on your server as html and PHP files. ' +
						'If you need to delete them, use the button below.'
						) }
					</p>
					<div>
						<Button
							compact={ true }
							type="submit">
								{ translate( 'Delete Cache' ) }
						</Button>
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( Easy );
