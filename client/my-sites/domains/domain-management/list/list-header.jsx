/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { CompactCard } from '@automattic/components';
import AddDomainButton from 'calypso/my-sites/domains/domain-management/list/add-domain-button';
import { ListAllActions } from 'calypso/my-sites/domains/domain-management/list/utils';
import FormCheckbox from 'calypso/components/forms/form-checkbox';

/**
 * Style dependencies
 */
import './style.scss';

class ListHeader extends React.PureComponent {
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
		return <AddDomainButton specificSiteActions={ true } />;
	}

	renderDefaultHeaderContent() {
		return (
			<>
				<span className="list__domains-header">Your site domains</span>
				{ ! this.props.isManagingAllSites && this.renderAddDomainToThisSiteButton() }
			</>
		);
	}

	renderHeaderContent() {
		const { isChecked, disabled, isBusy, translate } = this.props;

		if (
			ListAllActions.editContactInfo === this.props?.action ||
			ListAllActions.editContactEmail === this.props?.action
		) {
			return (
				<>
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
				</>
			);
		}

		return this.renderDefaultHeaderContent();
	}

	render() {
		const { headerClasses } = this.props;

		const listHeaderClasses = classNames( 'list-header', headerClasses );

		return (
			<CompactCard className={ listHeaderClasses }>{ this.renderHeaderContent() }</CompactCard>
		);
	}
}

export default localize( ListHeader );
