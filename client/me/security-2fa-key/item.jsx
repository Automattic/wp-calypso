import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { recordGoogleEvent } from '../../state/analytics/actions';
import Security2faDeleteButton from './delete-item-button';

function Security2faKeyItem( props ) {
	return (
		<CompactCard>
			<div className="security-2fa-key__item">
				<div className="security-2fa-key__item-information">
					<h2 className="security-2fa-key__item-title">
						{ props.securityKey.name === '' ? 'Key' : props.securityKey.name }
					</h2>
				</div>
				<Security2faDeleteButton securityKey={ props.securityKey } onDelete={ props.onDelete } />
			</div>
		</CompactCard>
	);
}

Security2faKeyItem.propTypes = {
	onDelete: PropTypes.func.isRequired,
	securityKey: PropTypes.object.isRequired,
};

export default connect( null, {
	recordGoogleEvent,
} )( localize( Security2faKeyItem ) );
