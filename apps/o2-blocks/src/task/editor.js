/**
 * External dependencies
 */
import classnames from 'classnames';
import moment from 'moment';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { RichText, InspectorControls } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import {
	BaseControl,
	Button,
	CustomSelectControl,
	DatePicker,
	Dropdown,
	TextControl,
	PanelBody,
} from '@wordpress/components';

import './editor.scss';
const name = 'a8c/task';

const edit = ( { attributes, setAttributes, mergeBlocks, onReplace, className } ) => {
	const { assignedTo, content, placeholder, status, dueDate, startDate } = attributes;
	const todoClass = classnames( 'wp-block-todo', className, { 'is-checked': status === 'done' } );

	const options = [
		{
			key: 'new',
			name: 'New',
		},
		{
			key: 'in-progress',
			name: 'In Progress',
		},
		{
			key: 'done',
			name: 'Done',
		},
	];

	const dueDateDisplay = dueDate ? moment( dueDate ).format( 'll' ) : '';
	const startDateDisplay = startDate ? moment( startDate ).format( 'll' ) : '';

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Status' ) }>
					<CustomSelectControl
						label={ __( 'Status' ) }
						options={ options }
						value={ options.find( ( option ) => option.key === status ) || options[ 0 ] }
						onChange={ ( value ) => setAttributes( { status: value.selectedItem.key } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Assignment' ) }>
					<TextControl
						label={ __( 'Username' ) }
						value={ assignedTo || '' }
						onChange={ ( value ) => setAttributes( { assignedTo: value } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Date' ) }>
					<Dropdown
						renderToggle={ ( { isOpen, onToggle } ) => (
							<>
								{ startDate ? (
									<BaseControl
										label="Start Date"
										id="wp-block-task__start-date-button"
										className="wp-block-task__date-button"
									>
										<Button
											id="wp-block-task__start-date-button"
											isLink={ ! startDate }
											isLarge={ !! startDate }
											onClick={ onToggle }
											aria-expanded={ isOpen }
										>
											{ startDateDisplay || 'Set start date' }
										</Button>
									</BaseControl>
								) : (
									<Button
										id="wp-block-task__start-date-button"
										isLink={ ! startDate }
										isLarge={ !! startDate }
										onClick={ onToggle }
										aria-expanded={ isOpen }
										style={ { marginBottom: '20px' } }
									>
										{ startDateDisplay || 'Set start date' }
									</Button>
								) }
							</>
						) }
						renderContent={ () => (
							<DatePicker
								currentDate={ startDate }
								onChange={ ( date ) => setAttributes( { startDate: date } ) }
							/>
						) }
					/>
					<Button isLink onClick={ () => setAttributes( { startDate: '' } ) }>
						Clear
					</Button>
					<Dropdown
						renderToggle={ ( { isOpen, onToggle } ) => (
							<BaseControl
								label="Due Date"
								id="wp-block-task__due-date-button"
								className="wp-block-task__date-button"
							>
								<Button
									id="wp-block-task__due-date-button"
									isLarge
									onClick={ onToggle }
									aria-expanded={ isOpen }
								>
									{ dueDateDisplay || 'No due date' }
								</Button>
							</BaseControl>
						) }
						renderContent={ () => (
							<DatePicker
								currentDate={ dueDate }
								onChange={ ( date ) => setAttributes( { dueDate: date } ) }
							/>
						) }
					/>
					<Button isLink onClick={ () => setAttributes( { dueDate: '' } ) }>
						Clear
					</Button>
				</PanelBody>
			</InspectorControls>
			<div className={ todoClass }>
				{ ( status === 'done' || status === 'new' ) && (
					<Button
						className="wp-block-todo__status"
						onClick={ () => setAttributes( { status: 'in-progress' } ) }
					/>
				) }
				{ status === 'in-progress' && (
					<Button
						className="wp-block-todo__is-in-progress"
						onClick={ () => setAttributes( { status: 'done' } ) }
					>
						In Progress
					</Button>
				) }
				<RichText
					identifier="content"
					wrapperClassName="wp-block-todo__text"
					value={ content }
					onChange={ ( value ) => setAttributes( { content: value } ) }
					onMerge={ mergeBlocks }
					onSplit={ ( value ) => {
						if ( ! content.length ) {
							return createBlock( 'core/paragraph' );
						}

						if ( ! value ) {
							return createBlock( name );
						}

						return createBlock( name, {
							...attributes,
							content: value,
						} );
					} }
					onReplace={ onReplace }
					onRemove={ onReplace ? () => onReplace( [] ) : undefined }
					className={ className }
					placeholder={ placeholder || __( 'Add task…' ) }
				/>
				{ assignedTo && (
					<div className="wp-block-todo__assigned">
						<span>@{ assignedTo }</span>
						<span className="wp-block-todo__avatar">{ assignedTo[ 0 ] }</span>
					</div>
				) }
				{ dueDate && (
					<span className="wp-block-todo__date">
						<Dropdown
							renderToggle={ ( { isOpen, onToggle } ) => (
								<Button onClick={ onToggle } aria-expanded={ isOpen }>
									{ dueDateDisplay || 'No due date' }
								</Button>
							) }
							renderContent={ () => (
								<DatePicker
									currentDate={ dueDate }
									onChange={ ( date ) => setAttributes( { dueDate: date } ) }
								/>
							) }
						/>
					</span>
				) }
			</div>
		</>
	);
};

export default edit;
