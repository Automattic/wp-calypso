/**
 * External dependencies
 */
import React, { PropTypes, Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import FormToggle from 'components/forms/form-toggle';
import FormTextInputWithAction from 'components/forms/form-text-input-with-action';

class EditorShareADraft extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		return (
			<Accordion className="editor-share-a-draft" title={ translate( 'Share a Draft' ) }>
				<p>
					{ translate(
						'Enable draft sharing and we’ll create a public link to your draft, ' +
							'so you can ask a trusted reader for feedback before you publish.',
					) }
				</p>
				<FormToggle>
					{ translate( 'Enable draft sharing' ) }
				</FormToggle>
				<FormTextInputWithAction
					readonly
					action={ translate( 'Copy', { context: 'verb' } ) }
				/>
			</Accordion>
		);
	}
}

export default localize( EditorShareADraft );
