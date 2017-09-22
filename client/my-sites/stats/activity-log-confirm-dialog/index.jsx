/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Dialog from 'components/dialog';

class ActivityLogConfirmDialog extends Component {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
		isVisible: PropTypes.bool.isRequired,
		onClose: PropTypes.func.isRequired,
		onConfirm: PropTypes.func.isRequired,
		siteTitle: PropTypes.string,
		timestamp: PropTypes.number,

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
			applySiteOffset,
			isVisible,
			moment,
			siteTitle,
			timestamp,
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
							'To proceed please confirm this restore on your site %(siteTitle)s',
							{ args: { siteTitle } }
						)
					}
				</p>

				<div className="activity-log-confirm-dialog__line">
					<Gridicon icon={ 'history' } />
					{
						translate( 'Restoring to {{b}}%(time)s{{/b}}', {
							args: {
								time: applySiteOffset( moment.utc( timestamp ) ).format( 'LLL' ),
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
					href="https://help.vaultpress.com/one-click-restore/"
				>
					{ translate( 'Read more about site restores' ) }
				</a>
			</Dialog>
		);
	}
}

export default localize( ActivityLogConfirmDialog );
