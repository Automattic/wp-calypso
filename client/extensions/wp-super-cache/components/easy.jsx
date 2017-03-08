/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
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
	static propTypes = {
		site: PropTypes.object.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		checkedRadio: 'off',
	};

	handleRadioChange = event => this.setState( { checkedRadio: event.currentTarget.value } );

	render() {
		const { site, translate } = this.props;
		const { checkedRadio } = this.state;

		return (
			<div>
				<SectionHeader label={ translate( 'Caching' ) }>
					<Button
						compact={ true }
						primary={ true }
						type="submit">
							{ translate( 'Save Settings' ) }
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
						'Cached pages are stored on your server as HTML and PHP files. ' +
						'If you need to delete them, use the buttons below.'
						) }
					</p>
					<div>
						<Button
							compact={ true }
							style={ { marginRight: '8px' } }
							type="submit">
								{ translate( 'Delete Cache' ) }
						</Button>
						{ site.jetpack && site.is_multisite &&
							<Button
								compact={ true }
								type="submit">
									{ translate( 'Delete Cache On All Blogs' ) }
							</Button>
						}
					</div>
				</Card>
			</div>
		);
	}
}

export default localize( Easy );
