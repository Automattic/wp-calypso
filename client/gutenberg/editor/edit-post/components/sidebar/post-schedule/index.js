/** @format */
/* eslint-disable wpcalypso/jsx-classname-namespace */
/**
 * External dependencies
 */
import React from 'react';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { PanelRow, Dropdown, Button } from '@wordpress/components';
import { withInstanceId } from '@wordpress/compose';
import {
	PostSchedule as PostScheduleForm,
	PostScheduleLabel,
	PostScheduleCheck,
} from '@wordpress/editor';
import { Fragment } from '@wordpress/element';

export function PostSchedule( { instanceId } ) {
	return (
		<PostScheduleCheck>
			<PanelRow className="edit-post-post-schedule">
				<label
					htmlFor={ `edit-post-post-schedule__toggle-${ instanceId }` }
					id={ `edit-post-post-schedule__heading-${ instanceId }` }
				>
					{ __( 'Publish' ) }
				</label>
				<Dropdown
					position="bottom left"
					contentClassName="edit-post-post-schedule__dialog"
					renderToggle={ ( { onToggle, isOpen } ) => (
						<Fragment>
							<label
								className="edit-post-post-schedule__label"
								htmlFor={ `edit-post-post-schedule__toggle-${ instanceId }` }
							>
								<PostScheduleLabel /> { __( 'Click to change' ) }
							</label>
							<Button
								id={ `edit-post-post-schedule__toggle-${ instanceId }` }
								type="button"
								className="edit-post-post-schedule__toggle"
								onClick={ onToggle }
								aria-expanded={ isOpen }
								aria-live="polite"
								isLink
							>
								<PostScheduleLabel />
							</Button>
						</Fragment>
					) }
					renderContent={ () => <PostScheduleForm /> }
				/>
			</PanelRow>
		</PostScheduleCheck>
	);
}

export default withInstanceId( PostSchedule );
