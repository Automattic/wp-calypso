import ListPopover from '../popover';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import JanitorialList from '../janitorial-list';

const Tiers = ( { tiers, blockId, onChangeTiers, selected } ) => {
	const [ showListPopover, setListPopover ] = useState( false );
	const [ tierIndex, setTierIndex ] = useState( false );
	const [ isEdit, setIsEdit ] = useState( false );
	const pageId = wp.data.select( 'core/editor' ).getCurrentPostId();

	const onAddNewLink = () => {
		setIsEdit( false );
		setTierIndex( false );
		setListPopover( true );
	};

	const closePopover = () => {
		setListPopover( false );
	};

	const deleteList = ( index ) => {
		const newTiers = [ ...tiers ];
		newTiers.splice( index, 1 );
		onChangeTiers( newTiers );
	};

	const openPopover = ( tierIndex ) => {
		setTierIndex( tierIndex );
		setListPopover( true );
	};

	const addUpdate = ( tier ) => {
		const index = false !== tierIndex ? tierIndex : tiers.length;
		const modifiedTiers = [ ...tiers ];
		modifiedTiers[ index ] = tier;
		onChangeTiers( modifiedTiers );
	};

	return (
		<>
			<JanitorialList
				blockId={ blockId }
				tiers={ tiers }
				pageId={ pageId }
				canEdit={ true }
				isFrontend={ false }
				deleteList={ deleteList }
				openPopover={ openPopover }
				selected={ selected }
				setIsEdit={ setIsEdit }
				updateTiers={ onChangeTiers }
			/>
			<Button isSecondary onClick={ onAddNewLink }>
				Add new link
			</Button>
			{ showListPopover && (
				<ListPopover
					closePopover={ closePopover }
					isEdit={ isEdit }
					tier={ false !== tierIndex ? tiers[ tierIndex ] : {} }
					addUpdate={ addUpdate }
				/>
			) }
		</>
	);
};

export default Tiers;
