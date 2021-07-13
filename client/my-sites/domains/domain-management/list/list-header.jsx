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
import { CompactCard } from '@automattic/components';
import InfoPopover from 'calypso/components/info-popover';
import { getGoogleMailServiceFamily } from 'calypso/lib/gsuite';
import { getTitanProductName } from 'calypso/lib/titan';
import { ListAllActions } from 'calypso/my-sites/domains/domain-management/list/utils';
import FormCheckbox from 'calypso/components/forms/form-checkbox';

/**
 * Style dependencies
 */
import './style.scss';
import Tooltip from 'calypso/components/tooltip';

class ListHeader extends React.PureComponent {
	static propTypes = {
		action: PropTypes.string,
		headerClasses: PropTypes.object,
		isChecked: PropTypes.bool,
		disabled: PropTypes.bool,
		isBusy: PropTypes.bool,
		onToggle: PropTypes.func,
	};

	static defaultProps = {
		disabled: false,
		onToggle: null,
		isBusy: false,
		isChecked: false,
	};

	constructor() {
		super();
		this.state = {};
		this.headerElements = {
			transferLock: {
				ref: React.createRef(),
				enableTooltip: this.enableTooltip.bind( this, 'transferLock' ),
				disableTooltip: this.disableTooltip.bind( this, 'transferLock' ),
				tooltipName: 'transferLockTooltipVisible',
			},
			privacy: {
				ref: React.createRef(),
				enableTooltip: this.enableTooltip.bind( this, 'privacy' ),
				disableTooltip: this.disableTooltip.bind( this, 'privacy' ),
				tooltipName: 'privacyTooltipVisible',
			},
			autoRenew: {
				ref: React.createRef(),
				enableTooltip: this.enableTooltip.bind( this, 'autoRenew' ),
				disableTooltip: this.disableTooltip.bind( this, 'autoRenew' ),
				tooltipName: 'autoRenewTooltipVisible',
			},
			email: {
				ref: React.createRef(),
				enableTooltip: this.enableTooltip.bind( this, 'email' ),
				disableTooltip: this.disableTooltip.bind( this, 'email' ),
				tooltipName: 'emailTooltipVisible',
			},
		};
	}

	enableTooltip = ( name ) => {
		this.setState( { [ `${ name }TooltipVisible` ]: true } );
	};

	disableTooltip = ( name ) => {
		this.setState( { [ `${ name }TooltipVisible` ]: false } );
	};

	stopPropagation = ( event ) => {
		event.stopPropagation();
	};

	onToggle = ( event ) => {
		if ( this.props.onToggle ) {
			this.props.onToggle( event.target.checked );
		}
	};

	renderHeaderItems() {
		const { translate } = this.props;
		const items = [
			{
				className: 'list__domain-transfer-lock',
				name: 'transferLock',
				title: translate( 'Transfer lock' ),
				popoverText: translate(
					'When enabled, a transfer lock prevents your domain from being transferred to another ' +
						'provider. Sometimes the transfer lock cannot be disabled, such as when a domain ' +
						'is recently registered.'
				),
			},

			{
				className: 'list__domain-privacy',
				name: 'privacy',
				title: translate( 'Privacy' ),
				popoverText: translate(
					'Enabling domain privacy protection hides your contact information from public view. ' +
						'For some domain extensions, such as some country specific domain extensions, ' +
						'privacy protection is not available.'
				),
			},

			{
				className: 'list__domain-auto-renew',
				name: 'autoRenew',
				title: translate( 'Auto-renew' ),
				popoverText: translate(
					'When auto-renew is enabled, we will automatically attempt to renew your domain 30 days ' +
						'before it expires, to ensure you do not lose access to your domain.'
				),
			},

			{
				className: 'list__domain-email',
				name: 'email',
				title: translate( 'Email' ),
				popoverText: translate(
					'You can receive email using your custom domain by purchasing %(titanMailService)s or %(googleMailService)s, or by ' +
						'setting up email forwarding. Note that email forwarding requires a plan subscription.',
					{
						args: {
							googleMailService: getGoogleMailServiceFamily(),
							titanMailService: getTitanProductName(),
						},
						comment:
							'%(googleMailService)s can be either "G Suite" or "Google Workspace"; %(titanMailService)s will be "Professional Email" translated',
					}
				),
			},
		];

		return items.map( ( item ) => (
			<div
				key={ item.name }
				className={ item.className }
				onMouseEnter={ this.headerElements[ item.name ].enableTooltip }
				onMouseLeave={ this.headerElements[ item.name ].disableTooltip }
				ref={ this.headerElements[ item.name ].ref }
			>
				<span>{ item.title }</span>
				<InfoPopover iconSize={ 18 }>{ item.popoverText }</InfoPopover>
				<Tooltip
					context={ this.headerElements[ item.name ].ref.current }
					isVisible={ this.state[ this.headerElements[ item.name ].tooltipName ] }
					position="top"
				>
					{ item.title }
				</Tooltip>
			</div>
		) );
	}

	renderDefaultHeaderContent() {
		return (
			<>
				<div className="list__domain-link" />
				{ this.renderHeaderItems() }
				<div className="list__domain-options"></div>
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
