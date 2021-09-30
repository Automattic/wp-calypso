import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import ListEnd from 'calypso/components/list-end';
import { bumpStat } from 'calypso/state/analytics/actions';

import './style.scss';

class InvitesListEnd extends PureComponent {
	static propTypes = {
		shown: PropTypes.number,
		found: PropTypes.number,
	};

	constructor( props ) {
		super( props );
		this.bumpedStat = false;
	}

	UNSAFE_componentWillReceiveProps( nextProps ) {
		if ( nextProps.found > nextProps.shown && ! this.bumpedStat ) {
			this.props.bumpStat( 'calypso_people_invite_list', 'displayed_max' );
			this.bumpedStat = true;
		}
	}

	render() {
		const { shown, found, translate } = this.props;

		return (
			<Fragment>
				{ shown < found && (
					<div className="people-invites__max-items-notice">
						{ translate(
							'Showing %(shown)d invite of %(found)d.',
							'Showing %(shown)d invites of %(found)d.',
							{ args: { shown, found } }
						) }
						<br />
						{ translate( 'To view more invites, clear some of your existing invites first.' ) }
					</div>
				) }
				<ListEnd />
			</Fragment>
		);
	}
}

export default connect( null, { bumpStat } )( localize( InvitesListEnd ) );
