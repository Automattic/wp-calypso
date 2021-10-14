import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import SectionHeader from 'calypso/components/section-header';
import OptionsDomainButton from 'calypso/my-sites/domains/domain-management/list/options-domain-button';
import { ListAllActions } from 'calypso/my-sites/domains/domain-management/list/utils';

import './style.scss';

class ListHeader extends PureComponent {
	static propTypes = {
		action: PropTypes.string,
		headerClasses: PropTypes.object,
		isChecked: PropTypes.bool,
		disabled: PropTypes.bool,
		isBusy: PropTypes.bool,
		onToggle: PropTypes.func,
		isManagingAllSites: PropTypes.bool,
	};

	static defaultProps = {
		disabled: false,
		onToggle: null,
		isBusy: false,
		isChecked: false,
		isManagingAllSites: false,
	};

	stopPropagation = ( event ) => {
		event.stopPropagation();
	};

	onToggle = ( event ) => {
		if ( this.props.onToggle ) {
			this.props.onToggle( event.target.checked );
		}
	};

	renderAddDomainToThisSiteButton() {
		if ( ! config.isEnabled( 'upgrades/domain-search' ) ) {
			return null;
		}
		return <OptionsDomainButton specificSiteActions={ true } />;
	}

	renderDefaultHeaderContent() {
		return (
			<SectionHeader label={ this.props.translate( 'Your site domains' ) }>
				{ ! this.props.isManagingAllSites && this.renderAddDomainToThisSiteButton() }
			</SectionHeader>
		);
	}

	render() {
		const { isChecked, disabled, isBusy, headerClasses, translate } = this.props;

		if (
			ListAllActions.editContactInfo === this.props?.action ||
			ListAllActions.editContactEmail === this.props?.action
		) {
			const listHeaderClasses = classNames( 'list-header', headerClasses );
			return (
				<CompactCard className={ listHeaderClasses }>
					<FormCheckbox
						className="list__checkbox"
						onChange={ this.onToggle }
						onClick={ this.stopPropagation }
						checked={ isChecked }
						disabled={ disabled || isBusy }
					/>
					<strong>
						{ translate( 'Update the selected domains with the contact information above.' ) }
					</strong>
				</CompactCard>
			);
		}

		return this.renderDefaultHeaderContent();
	}
}

export default localize( ListHeader );
