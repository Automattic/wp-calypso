/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import Button from 'components/button';

class ErrorBanner extends PureComponent {
	static propTypes = {
		requestRestore: PropTypes.func.isRequired,
		timestamp: PropTypes.number.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	handleClickRestore = () => this.props.requestRestore( this.props.timestamp );

	render() {
		const { translate } = this.props;

		return (
			<ActivityLogBanner
				isDismissable
				onDismissClick={ /* FIXME */ function() {} }
				status="error"
				title={ translate( 'Problem restoring your site' ) }
			>
				<p>{ translate( 'We came across a problem while trying to restore your site.' ) }</p>
				<Button primary onClick={ this.handleClickRestore }>
					{ translate( 'Try again' ) }
				</Button>
				{ '  ' }
				<Button>
					{ translate( 'Get help' ) }
				</Button>
			</ActivityLogBanner>
		);
	}
}

export default localize( ErrorBanner );
