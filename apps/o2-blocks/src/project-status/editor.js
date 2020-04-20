/**
 * External dependencies
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { InspectorControls } from '@wordpress/block-editor';
import { CustomSelectControl, PanelBody, TextControl } from '@wordpress/components';
import { withSelect } from '@wordpress/data';

import './editor.scss';

const edit = ( {
	attributes,
	allTasks,
	pendingTasks,
	completedTasks,
	unassignedTasks,
	setAttributes,
} ) => {
	const { estimate, team } = attributes;

	const estimates = [
		{
			key: '',
			name: '---',
		},
		{
			key: '1-week',
			name: '1 week',
		},
		{
			key: '2-weeks',
			name: '2 weeks',
		},
		{
			key: '3-weeks',
			name: '3 weeks',
		},
	];

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Project Settings' ) }>
					<TextControl
						label={ __( 'Team Assignment' ) }
						value={ team }
						onChange={ ( value ) => setAttributes( { team: value } ) }
					/>
					<CustomSelectControl
						label={ __( 'Time Estimate' ) }
						options={ estimates }
						value={ estimates.find( ( option ) => option.key === estimate ) || estimates[ 0 ] }
						onChange={ ( value ) => setAttributes( { estimate: value.selectedItem.key } ) }
					/>
				</PanelBody>
			</InspectorControls>
			<div className="wp-block-project-status__header">
				<span className="wp-block-project-status__title">Project Overview</span>
				<div className="wp-block-project-status__counts">
					<span className="wp-block-project-status__total">{ allTasks } Tasks</span>
					<span>
						{ completedTasks } Completed ({ ( completedTasks * 100 ) / allTasks }%)
					</span>
					<span>{ pendingTasks + unassignedTasks } Pending</span>
				</div>
			</div>
			<div className="wp-block-project-status__bar">
				<span
					style={ {
						display: 'block',
						width: ( completedTasks * 730 ) / allTasks,
						background: '#22DE84',
						height: '18px',
					} }
				></span>
				<span
					style={ {
						display: 'block',
						width: ( pendingTasks * 730 ) / allTasks,
						background: '#D6F3E3',
						height: '18px',
					} }
				></span>
			</div>
			{ ( estimate || team ) && (
				<div className="wp-block-project-status__footer">
					{ team && <span className="wp-block-project-status__team">{ 'Team ' + team }</span> }
					{ estimate && (
						<span className="wp-block-project-status__estimate">
							{ estimate && estimates.find( ( option ) => option.key === estimate ).name }
						</span>
					) }
				</div>
			) }
		</>
	);
};

export default withSelect( ( select ) => {
	const tasks = select( 'core/block-editor' )
		.getBlocks()
		.filter( ( block ) => {
			return block.name === 'a8c/task';
		} );

	return {
		allTasks: tasks.length,
		completedTasks: tasks.filter( ( task ) => task.attributes.status === 'done' ).length,
		pendingTasks: tasks.filter( ( task ) => task.attributes.status === 'in-progress' ).length,
		unassignedTasks: tasks.filter( ( task ) => task.attributes.status === 'new' ).length,
	};
} )( edit );
