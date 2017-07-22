/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Accordion from 'components/accordion';
import Gravatar from 'components/gravatar';
import Button from 'components/button';

const AccessButton = ( { additionalClassName, icon, label, onClick } ) =>
	<Button
		is-borderless
		className={ `editor-sidebar__feedback-access-button ${ additionalClassName }` }
		onClick={ onClick }
	>
		<Gridicon icon={ icon } className="editor-sidebar__feedback-access-button-icon" />
		<span className="editor-sidebar__feedback-access-button-text">
			{ label }
		</span>
	</Button>;

export class FeedbackShare extends PureComponent {
	static propTypes = {
		share: PropTypes.object.isRequired,
		onToggle: PropTypes.func.isRequired,
		onRevokeAccess: PropTypes.func.isRequired,
		onRestoreAccess: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	onRevoke = () => this.props.onRevokeAccess( this.props.share.emailAddress );
	onRestore = () => this.props.onRestoreAccess( this.props.share.emailAddress );

	render() {
		const { share, onToggle, translate } = this.props;
		const { emailAddress, comments, isEnabled } = share;

		return (
			<Accordion
				className="editor-sidebar__feedback-share"
				title={ emailAddress }
				subtitle="Subtitle TODO"
				icon={ <Gravatar size={ 24 } /> }
				onToggle={ onToggle }
			>
				{ comments.length === 0
					? <p className="editor-sidebar__feedback-share-empty-message">
							{ translate( 'No feedback yet.' ) }
						</p>
					: comments.map(
							// NOTE: It should be OK to use the index for `key` because
							// the list is currently append-only
							( comment, index ) =>
								<p key={ index } className="editor-sidebar__feedback-share-comment">
									{ comment }
								</p>,
						) }
				{ isEnabled
					? <AccessButton
							additionalClassName="is-revoke"
							icon="link-break"
							label={ translate( 'Revoke Access' ) }
							onClick={ this.onRevoke }
						/>
					: <AccessButton
							additionalClassName="is-restore"
							icon="link"
							label={ translate( 'Restore Access' ) }
							onClick={ this.onRestore }
						/> }
			</Accordion>
		);
	}
}

export default localize( FeedbackShare );
