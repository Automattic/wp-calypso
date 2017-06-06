/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import Button from 'components/button';
import Gridicon from 'gridicons';

class ActivityLogConfirmDialog extends Component {
	static propTypes = {
		isVisible: PropTypes.bool.isRequired,
		onClose: PropTypes.func.isRequired,
		onConfirm: PropTypes.func.isRequired,
		siteName: PropTypes.string.isRequired,
		dateIsoString: PropTypes.string.isRequired,

		// Localize
		translate: PropTypes.func.isRequired,
		moment: PropTypes.func.isRequired,
	};

	static defaultProps = {
		isVisible: false,
	};

	renderButtons() {
		const {
			onClose,
			onConfirm,
			translate,
		} = this.props;
		return (
			<div>
				<Button onClick={ onClose }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button primary scary onClick={ onConfirm }>
					{ translate( 'Restore' ) }
				</Button>
			</div>
		);
	}

	render() {
		const {
			isVisible,
			moment,
			siteName,
			dateIsoString,
			translate,
		} = this.props;

		return (
			<Dialog
				additionalClassNames="activity-log-confirm-dialog"
				isVisible={ isVisible }
			>
				<h1>{ translate( 'Restore Site' ) }</h1>
				<p className="activity-log-confirm-dialog__highlight">
					{
						translate(
							'To proceed please confirm this restore on your site %(siteName)s',
							{ args: { siteName } }
						)
					}
				</p>

				<div className="activity-log-confirm-dialog__line">
					<Gridicon icon={ 'history' } />
					{
						translate( 'Restoring to {{b}}%(time)s{{/b}}', {
							args: {
								time: moment( dateIsoString ).format( 'LLL' ),
							},
							components: { b: <b /> },
						} )
					}
				</div>
				<div className="activity-log-confirm-dialog__line">
					<Gridicon icon={ 'notice' } />
					{ translate( 'This will remove all content and options created or changed since then.' ) }
				</div>

				<div className="activity-log-confirm-dialog__button-wrap">
					{ this.renderButtons() }
				</div>

				<a
					className="activity-log-confirm-dialog__more-info-link"
					href="#" // FIXME: real link
				>
					{ translate( 'Read More about Site Restores' ) }
				</a>
			</Dialog>
		);
	}
}

export default localize( ActivityLogConfirmDialog );
