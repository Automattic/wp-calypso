/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormTextArea from 'components/forms/form-textarea';
import SectionHeader from 'components/section-header';
import { addQueryArgs } from 'lib/url';

class AnotherReason extends PureComponent {
	state = {
		reason: '',
	};

	handleChange = event => {
		this.setState( { reason: event.target.value } );
	};

	render() {
		const { confirmHref, translate } = this.props;

		return (
			<div className="disconnect-site__another-reason">
				<SectionHeader
					label={ translate(
						'Please share why you want to disconnect your site from WordPress.com.'
					) }
				/>
				<Card>
					<FormTextArea onChange={ this.handleChange } value={ this.state.reason } />
					<Button
						disabled={ ! this.state.reason }
						href={
							this.state.reason
								? addQueryArgs( { reason: 'other', text: this.state.reason }, confirmHref )
								: null
						}
						primary
					>
						{ translate( 'Submit' ) }
					</Button>
				</Card>
			</div>
		);
	}
}

export default localize( AnotherReason );
