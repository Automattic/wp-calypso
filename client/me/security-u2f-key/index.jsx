/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import getU2fKeys from 'state/selectors/get-u2f-keys';
import getNewU2fKey from 'state/selectors/get-new-u2f-key';
import SectionHeader from 'components/section-header';
import SecurityU2fKeyList from 'me/security-u2f-key-list';
import { recordGoogleEvent } from 'state/analytics/actions';

class SecurityU2fKey extends React.Component {
	static initialState = Object.freeze( {
		addingKey: false,
	} );

	state = this.constructor.initialState;

	getClickHandler = ( action, callback ) => {
		return event => {
			this.props.recordGoogleEvent( 'Me', 'Clicked on ' + action );

			if ( callback ) {
				callback( event );
			}
		};
	};

	toggleAddNewU2fKey = event => {
		event.preventDefault();
		this.setState( { addingKey: ! this.state.addingKey } );
	};

	render() {
		const { translate, u2fKeys } = this.props;
		const { addingKey } = this.state;
		return (
			<Fragment>
				<SectionHeader label={ translate( 'Security Key' ) }>
					{ ! addingKey &&
						! u2fKeys.length && (
							<Button
								compact
								onClick={ this.getClickHandler(
									'Register New Key Button',
									this.toggleAddNewU2fKey
								) }
							>
								{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
								<Gridicon icon="plus-small" size={ 16 } />
								{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
								{ translate( 'Register Key' ) }
							</Button>
						) }
				</SectionHeader>
				{ !! u2fKeys.length && <SecurityU2fKeyList /> }
				{ addingKey && <SecurityU2fKeyList /> }
				{ ! addingKey &&
					! u2fKeys.length && <Card>Use a Universal 2nd Factor security key to sign in.</Card> }
			</Fragment>
		);
	}
}

export default connect(
	state => ( {
		u2fKeys: getU2fKeys( state ),
		newU2fKey: getNewU2fKey( state ),
	} ),
	{
		recordGoogleEvent,
	}
)( localize( SecurityU2fKey ) );
