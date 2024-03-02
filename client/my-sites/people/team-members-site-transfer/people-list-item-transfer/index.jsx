import { CompactCard } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PeopleProfile from 'calypso/my-sites/people/people-profile';
import './style.scss';

class PeopleListItemTransfer extends PureComponent {
	static displayName = 'PeopleListItem';

	static propTypes = {
		site: PropTypes.object,
	};

	render() {
		const { siteId, translate, user, onClick } = this.props;

		return (
			<CompactCard className="people-list-item" onClick={ () => onClick( user ) }>
				<div className="people-list-item-transfer__profile-container">
					<PeopleProfile siteId={ siteId } user={ user } />
					<span className="people-list-item-transfer__action">
						{ translate( 'Transfer ownership' ) }
					</span>
				</div>
			</CompactCard>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const { site } = ownProps;

	return {
		siteId: site?.ID,
	};
} )( localize( PeopleListItemTransfer ) );
