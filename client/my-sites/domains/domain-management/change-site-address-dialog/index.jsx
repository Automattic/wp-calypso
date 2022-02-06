import { Dialog } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SiteAddressChanger from 'calypso/blocks/site-address-changer';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import './style.scss';

class ChangeSiteAddressDialog extends Component {
	static propTypes = {
		domains: PropTypes.array.isRequired,
		selectedDomainName: PropTypes.string.isRequired,
		selectedSite: PropTypes.oneOfType( [ PropTypes.object, PropTypes.bool ] ).isRequired,
	};

	close = () => {
		this.props.closeDialog();
	};

	render() {
		const currentDomain = this.props.domain;
		const domainName = currentDomain?.name ?? '';
		const dotblogSubdomain = domainName.match( /\.\w+\.blog$/ );
		const currentDomainSuffix = dotblogSubdomain ? dotblogSubdomain[ 0 ] : '.wordpress.com';

		return (
			<Dialog
				className="change-site-address-dialog"
				isVisible={ this.props.isDialogVisible }
				onClose={ this.close }
				leaveTimeout={ 0 }
			>
				<SiteAddressChanger { ...{ currentDomain, currentDomainSuffix } } />
			</Dialog>
		);
	}
}

export default connect( ( state ) => ( {
	currentRoute: getCurrentRoute( state ),
} ) )( localize( ChangeSiteAddressDialog ) );
