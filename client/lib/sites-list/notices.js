/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import notices from 'client/notices';
import SitesLog from 'client/lib/sites-list/log-store';
import SitesListActions from 'client/lib/sites-list/actions';

class SitesListNotices extends Component {
	componentDidMount() {
		SitesLog.on( 'change', this.showNotification );
	}

	componentWillUnmount() {
		SitesLog.removeListener( 'change', this.showNotification );
	}

	refreshSiteNotices = () => {
		return {
			errors: SitesLog.getErrors(),
			inProgress: SitesLog.getInProgress(),
			completed: SitesLog.getCompleted(),
		};
	};

	showNotification = () => {
		const logNotices = this.refreshSiteNotices();

		this.setState( { notices: logNotices } );

		if ( logNotices.inProgress.length > 0 ) {
			notices.info( this.getMessage( logNotices.inProgress, this.inProgressMessage ), {
				persistent: true,
			} );
			return;
		}
		if ( logNotices.completed.length > 0 && logNotices.errors.length > 0 ) {
			notices.warning( this.erroredAndCompletedMessage( logNotices ), {
				onRemoveCallback: SitesListActions.removeSitesNotices.bind(
					this,
					logNotices.completed.concat( logNotices.errors )
				),
			} );
		} else if ( logNotices.errors.length > 0 ) {
			notices.error( this.getMessage( logNotices.errors, this.errorMessage ), {
				onRemoveCallback: SitesListActions.removeSitesNotices.bind( this, logNotices.errors ),
			} );
		} else if ( logNotices.completed.length > 0 ) {
			notices.success( this.getMessage( logNotices.completed, this.successMessage ), {
				onRemoveCallback: SitesListActions.removeSitesNotices.bind( this, logNotices.completed ),
			} );
		}
	};

	getMessage = ( logs, messageFunction ) => {
		const sampleLog = logs[ 0 ],
			sites = logs.map( function( log ) {
				return log.site && log.site.title;
			} ),
			translateArg = {
				count: logs.length,
				args: {
					siteName: sampleLog.site.title,
					siteNames: sites.join( ', ' ),
					numberOfSites: sites.length,
				},
			};

		return messageFunction( sampleLog.action, translateArg, sampleLog );
	};

	successMessage = ( action, translateArg ) => {
		switch ( action ) {
			case 'DISCONNECT_SITE':
				if ( 1 === translateArg.args.numberOfSites ) {
					return this.props.translate( 'Successfully disconnected %(siteName)s.', translateArg );
				}
				return this.props.translate(
					'Successfully disconnected %(numberOfSites)d site.',
					'Successfully disconnected %(numberOfSites)d sites.',
					translateArg
				);
		}
	};

	inProgressMessage = ( action, translateArg ) => {
		translateArg.context =
			'In progress message for when a Jetpack site is disconnecting from WP.com';
		switch ( action ) {
			case 'DISCONNECT_SITE':
				if ( 1 === translateArg.args.numberOfSites ) {
					return this.props.translate( 'Disconnecting %(siteName)s.', translateArg );
				}
				return this.props.translate(
					'Disconnecting %(numberOfSites)d site.',
					'Disconnecting %(numberOfSites)d sites.',
					translateArg
				);
		}
	};

	erroredAndCompletedMessage = logNotices => {
		const completedMessage = this.getMessage( logNotices.completed, this.successMessage );
		const errorMessage = this.getMessage( logNotices.errors, this.errorMessage );

		return this.props.translate( '%(completedMessage)s %(errorMessage)s', {
			args: {
				completedMessage: completedMessage,
				errorMessage: errorMessage,
			},
			context:
				'The success message and the error message after the disconnection success and failure.',
			comment: '%(completedMessage)s %(errorMessage)s are complete sentences.',
		} );
	};

	errorMessage = ( action, translateArg, sampleLog ) => {
		switch ( action ) {
			case 'RECEIVE_PLUGINS':
				if ( 1 === translateArg.args.numberOfSites ) {
					return this.props.translate( 'Error fetching plugins on %(siteName)s.', translateArg );
				}
				return this.props.translate(
					'Error fetching plugins on %(numberOfSites)d site: %(siteNames)s.',
					'Error fetching plugins on %(numberOfSites)d sites: %(siteNames)s.',
					translateArg
				);

			case 'DISCONNECT_SITE':
				switch ( sampleLog.error.error ) {
					case 'unauthorized':
					case 'unauthorized_access':
						if ( 1 === translateArg.args.numberOfSites ) {
							return this.props.translate(
								"You don't have permission to disconnect %(siteName)s.",
								translateArg
							);
						}
						return this.props.translate(
							"You don't have permission to disconnect %(numberOfSites)d site: %(siteNames)s.",
							"You don't have permission to disconnect %(numberOfSites)d sites: %(siteNames)s.",
							translateArg
						);

					default:
						if ( 1 === translateArg.args.numberOfSites ) {
							return this.props.translate( 'Error disconnecting %(siteName)s.', translateArg );
						}
						return this.props.translate(
							'Error disconnecting %(numberOfSites)d site: %(siteNames)s.',
							'Error disconnecting %(numberOfSites)d sites: %(siteNames)s.',
							translateArg
						);
				}
		}
	};

	state = { notices: this.refreshSiteNotices() };

	render() {
		return null;
	}
}

export default localize( SitesListNotices );
