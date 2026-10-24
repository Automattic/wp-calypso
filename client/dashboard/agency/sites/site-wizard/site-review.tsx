import { Button, CheckboxControl, TextControl } from '@wordpress/components';
import { __, sprintf, _n } from '@wordpress/i18n';
import { useId, useState } from 'react';
import { SITE_REVIEW_BULK_THRESHOLD } from './site-intake';
import SitePreview from './site-preview';
import type { IntakeSite } from './site-intake';

export default function SiteReview( {
	sites,
	chosen,
	completed,
	duplicates,
	managed,
	onChange,
	simulate,
}: {
	sites: IntakeSite[];
	chosen: string[];
	completed: string[];
	duplicates: number;
	managed: string[];
	onChange: ( ids: string[] ) => void;
	simulate?: boolean;
} ) {
	const [ search, setSearch ] = useState( '' );
	const unavailable = ( site: IntakeSite ) =>
		completed.includes( site.id ) || managed.includes( new URL( site.url ).host );
	const available = sites.filter( ( site ) => ! unavailable( site ) );
	const isLargeList = sites.length > SITE_REVIEW_BULK_THRESHOLD;
	const visible = sites.filter( ( site ) =>
		`${ site.name } ${ site.url }`.toLowerCase().includes( search.toLowerCase() )
	);
	return (
		<div className="agency-site-wizard__review" data-large-list={ isLargeList }>
			{ isLargeList && (
				<div className="agency-site-wizard__review-toolbar">
					<TextControl
						label={ __( 'Find a site' ) }
						hideLabelFromVision
						placeholder={ __( 'Find a site' ) }
						value={ search }
						onChange={ setSearch }
						__next40pxDefaultSize
						__nextHasNoMarginBottom
					/>
					<span role="status">
						{ sprintf(
							/* translators: 1: Number of selected sites, 2: Number of available sites. */
							__( '%1$d of %2$d selected' ),
							chosen.length,
							available.length
						) }
					</span>
				</div>
			) }
			{ isLargeList && (
				<div className="agency-site-wizard__review-shortcuts">
					<Button variant="link" onClick={ () => onChange( available.map( ( site ) => site.id ) ) }>
						{ __( 'Select all' ) }
					</Button>
					<Button
						variant="link"
						onClick={ () =>
							onChange(
								available
									.filter( ( site ) => ! site.staging )
									.slice( 0, 3 )
									.map( ( site ) => site.id )
							)
						}
					>
						{ __( 'Start with three' ) }
					</Button>
					<Button variant="link" onClick={ () => onChange( [] ) }>
						{ __( 'Clear selection' ) }
					</Button>
				</div>
			) }
			{ duplicates > 0 && (
				<p>
					{ sprintf(
						/* translators: %d is the number of sites. */
						_n( '%d duplicate address removed.', '%d duplicate addresses removed.', duplicates ),
						duplicates
					) }
				</p>
			) }
			<div className="agency-site-wizard__review-list">
				{ visible.map( ( site ) => (
					<ReviewRow
						key={ site.id }
						site={ site }
						simulate={ simulate }
						checked={ chosen.includes( site.id ) }
						disabled={ unavailable( site ) }
						status={ unavailable( site ) ? __( 'Added' ) : undefined }
						onChange={ ( checked ) =>
							onChange(
								checked ? [ ...chosen, site.id ] : chosen.filter( ( id ) => id !== site.id )
							)
						}
					/>
				) ) }
				{ ! visible.length && <p>{ __( 'No matching sites. Try another search.' ) }</p> }
			</div>
			{ isLargeList && (
				<p className="agency-site-wizard__review-help">
					{ __(
						'Start with a few, or choose them all. You can return to this list for the rest.'
					) }
				</p>
			) }
		</div>
	);
}

function ReviewRow( {
	site,
	checked,
	disabled,
	status,
	simulate,
	onChange,
}: {
	site: IntakeSite;
	checked: boolean;
	disabled: boolean;
	status?: string;
	simulate?: boolean;
	onChange: ( checked: boolean ) => void;
} ) {
	const id = useId();
	return (
		<div className="agency-site-wizard__review-row">
			<CheckboxControl
				id={ id }
				aria-label={ site.name }
				checked={ checked }
				disabled={ disabled }
				onChange={ onChange }
				__nextHasNoMarginBottom
			/>
			<SitePreview
				site={ site }
				labelFor={ id }
				simulate={ simulate }
				status={ status || ( site.staging ? __( 'Possible staging site' ) : undefined ) }
			/>
		</div>
	);
}
