import { Popover, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { isEmpty } from 'lodash';
import Tier from '../tiers/tier';
import './style.css';

const ListPopover = ( props ) => {
	const { closePopover, isEdit, tier: editedTier, addUpdate } = props;
	const [ tier, updateTier ] = useState( editedTier );
	const [ validate, setValidate ] = useState( false );
	const popoverTitle = isEdit ? 'Edit Link' : 'Add Link';
	const buttonLabel = isEdit ? 'Update' : 'Add';

	const onAddUpdate = () => {
		if (
			( tier.regularLink && ( isEmpty( tier.name ) || isEmpty( tier.link ) ) ) ||
			( ! tier.regularLink &&
				( isEmpty( tier.name ) || isEmpty( tier.repos ) || isEmpty( tier.issuesLabel ) ) )
		) {
			setValidate( true );
			window.alert( 'Please fill out all required fields' );
			return;
		}

		addUpdate( tier );
		closePopover();
		setValidate( false );
	};

	return (
		<Popover
			position="middle center"
			onFocusOutside={ closePopover }
			className="janitorial-state-widget-popover"
			noArrow={ true }
			expandOnMobile={ true }
		>
			<div className="janitorial-state-widget-popover-container">
				<h2>{ popoverTitle }</h2>
				<Tier tier={ tier } onChange={ updateTier } validate={ validate } />
				<Button isSecondary onClick={ onAddUpdate }>
					{ buttonLabel }
				</Button>
				<a href="#" className="janitorial-state-widget-popover-close" onClick={ closePopover }>
					Close
				</a>
			</div>
		</Popover>
	);
};

export default ListPopover;
