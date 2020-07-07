/**
 * External dependencies.
 */
import { useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';

/**
 * Internal dependencies
 */
import JanitorialListBullet from './bullet';
import DragIcon from './drag-icon';
import './style.css';

const JanitorialList = ( props ) => {
	const [ selected, setSelected ] = useState( props.selected );
	const {
		pageId,
		canEdit,
		isFrontend,
		deleteList,
		openPopover,
		setIsEdit,
		blockId,
		updateTiers,
	} = props;

	const SortableItem = SortableElement( ( { key, tierIndex, tier, isSelected, item } ) => {
		return (
			<li
				className={ isSelected ? 'janitorial-state-widget-tier-selected' : undefined }
				key={ key }
			>
				<JanitorialListBullet
					name={ tier.name }
					isSelected={ isSelected }
					updateSelected={ updateSelected }
					canEdit={ canEdit }
				/>
				{ item }
				{ isSelected ? (
					<span className="janitorial-state-widget-tier-selected-marker">{ '← In Progress' }</span>
				) : null }
				{ ! isFrontend ? (
					<small>
						{ <SortHandle /> }|
						<a href="#" title="Edit Link" alt="Edit Link" onClick={ () => onEdit( tierIndex ) }>
							Edit
						</a>
						|
						<a
							href="#"
							onClick={ () => onDelete( tierIndex ) }
							title="Delete link"
							alt="Delete link"
						>
							Delete
						</a>
					</small>
				) : null }
			</li>
		);
	} );

	const SortableList = SortableContainer( () => {
		return (
			<ul className="janitorial-state-widget-tier-ul">
				{ props.tiers.map( ( tier, index ) => {
					const isSelected = tier.name === selected;
					let item = tier.name;

					if ( item ) {
						const link = getLink( tier );
						item = isFrontend ? (
							<a href={ link } target="_blank">
								{ item }
							</a>
						) : (
							<a href="#">{ item }</a>
						);
					}
					return (
						<SortableItem
							key={ `item-${ index }` }
							index={ index }
							tierIndex={ index }
							tier={ tier }
							isSelected={ isSelected }
							item={ item }
							disabled={ isFrontend }
						/>
					);
				} ) }
			</ul>
		);
	} );

	const SortHandle = SortableHandle( () => {
		return <DragIcon />;
	} );

	const onSortEnd = ( { oldIndex, newIndex } ) => {
		const newOrder = arrayMove( props.tiers, oldIndex, newIndex );
		updateTiers( newOrder );
	};

	const updateSelected = ( name ) => {
		const { tiers } = props;
		const index = tiers.findIndex( ( item ) => item.name === name );

		setSelected( tiers[ index ].name );

		// Send REST API request to update the selected value.
		apiFetch( {
			path: '/wp/v2/pages/' + pageId + '/janitorial-state-widget/' + blockId,
			method: 'POST',
			data: {
				selected: tiers[ index ].name,
			},
		} ).then( ( res ) => {} );
	};

	const onEdit = ( tierIndex ) => {
		setIsEdit( true );
		openPopover( tierIndex );
	};

	const onDelete = ( index ) => {
		deleteList( index );
	};

	const parseRepos = ( repos ) => {
		if ( 'undefined' !== typeof repos ) {
			const newRepos = repos.replace( /\r?\n/g, '+repo:' );

			return encodeURI( newRepos );
		}

		return '';
	};

	const parseLabels = ( labels ) => {
		if ( 'undefined' !== typeof labels ) {
			const newLabels =
				'+label:"' +
				labels.replace( /\r?\n/g, '^^' ).replace( /\s/g, '+' ).replace( /\^\^/g, '"+label:"' ) +
				'"';

			return encodeURI( newLabels );
		}

		return '';
	};

	const getLink = ( tier ) => {
		if ( tier.regularLink ) {
			return tier.link;
		}

		const urlDomain = 'https://github.com/issues?l=&o=asc&q=repo:';
		const labels = parseLabels( tier.issuesLabel );
		const repos = parseRepos( tier.repos );
		const arg = `+${ tier.sortOrder }+state:open&s=created&type=Issues`;

		return urlDomain + repos + labels + arg;
	};

	return props.tiers.length ? (
		<div className="__inner-container">
			<SortableList
				onSortEnd={ onSortEnd }
				lockAxis={ 'y' }
				helperClass={ 'janitorial-state-widget-sort-helper' }
				transitionDuration={ 0 }
				useDragHandle={ true }
			/>
		</div>
	) : null;
};

export default JanitorialList;
