import { CompactCard } from '@automattic/components';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import FormCheckbox from 'calypso/components/forms/form-checkbox';
import { ListAllActions } from 'calypso/my-sites/domains/domain-management/list/utils';

import './style.scss';

class DomainsTableHeader extends PureComponent {
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

	renderHeaderContent() {
		const { headerClasses, translate } = this.props;
		const listHeaderClasses = classNames( 'domain-table-header', headerClasses );
		return (
			<div className={ listHeaderClasses }>
				<span className="list__domain-cell">{ translate( 'Domain' ) }</span>
				<span className="list__status-cell">{ translate( 'Status' ) }</span>
				<span className="list__registered-until-cell">{ translate( 'Registered until' ) }</span>
				<span className="list__auto-renew-cell">{ translate( 'Auto-renew' ) }</span>
				<span className="list__email-cell">{ translate( 'Email' ) }</span>
			</div>
		);
	}

	render() {
		const { isChecked, disabled, isBusy, headerClasses, translate } = this.props;

		if (
			ListAllActions.editContactInfo === this.props?.action ||
			ListAllActions.editContactEmail === this.props?.action
		) {
			const listHeaderClasses = classNames( 'domain-table-header', headerClasses );
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

		return this.renderHeaderContent();
	}
}

export default localize( DomainsTableHeader );
