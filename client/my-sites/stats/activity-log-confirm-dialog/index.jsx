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
		siteName: PropTypes.string.isRequired,
	};

	static defaultProps = {
		siteName: 'YourAwesomeSite', // FIXME: real site name
	};

	constructor( props ) {
		super( props );

		this.state = {
			showDialog: true,
		};

		this.onCloseDialog = this.onCloseDialog.bind( this );
	}

	renderButtons() {
		const { translate } = this.props;
		return (
			<div>
				<Button onClick={ this.onCloseDialog }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button primary scary onClick={ this.onCloseDialog }>
					{ translate( 'Restore' ) }
				</Button>
			</div>
		);
	}

	onCloseDialog() {
		this.setState( { showDialog: false } );
	}

	render() {
		const {
			translate,
			siteName,
		} = this.props;

		return (
			<Dialog
				additionalClassNames="activity-log-confirm-dialog"
				isVisible={ this.state.showDialog }
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
							args: { time: '31 May, 2017 at 3:58 PM.', /* FIXME: real time */ },
							components: { b: <b /> }
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
