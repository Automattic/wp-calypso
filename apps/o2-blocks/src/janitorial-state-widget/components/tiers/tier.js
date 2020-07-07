import { TextControl, TextareaControl, SelectControl, FormToggle } from '@wordpress/components';
import { useRef, useEffect } from '@wordpress/element';
import className from 'classnames';
import { isEmpty } from 'lodash';

const Tier = ( { tier, onChange, validate } ) => {
	const regLink = useRef( null );
	const ghLink = useRef( null );

	useEffect( () => {
		if ( tier.regularLink ) {
			regLink.current.style.maxHeight = `${ regLink.current.scrollHeight }px`;
		} else {
			ghLink.current.style.maxHeight = `${ ghLink.current.scrollHeight }px`;
		}
	}, [] );

	const onChangeName = ( name ) => {
		onChange( { ...tier, ...{ name } } );
	};

	const onChangeLink = ( link ) => {
		onChange( { ...tier, ...{ link } } );
	};

	const onChangeRepos = ( repos ) => {
		onChange( { ...tier, ...{ repos } } );
	};

	const onChangeIssuesLabel = ( issuesLabel ) => {
		onChange( { ...tier, ...{ issuesLabel } } );
	};

	const onChangeSortOrder = ( sortOrder ) => {
		onChange( { ...tier, ...{ sortOrder } } );
	};

	const onToggleRegularLink = () => {
		const regularLink = ! ( tier.regularLink || false );
		onChange( { ...tier, ...{ regularLink } } );

		regLink.current.style.maxHeight = regularLink ? `${ regLink.current.scrollHeight }px` : '0';
		ghLink.current.style.maxHeight = regularLink ? '0' : `${ ghLink.current.scrollHeight }px`;
	};

	if ( ! tier.hasOwnProperty( 'sortOrder' ) ) {
		onChangeSortOrder( 'sort:created-asc' );
	}

	const labelClassNames = className( 'janitorial-state-widget-popover-tier-label', {
		'janitorial-state-widget-popover-tier-label-not-valid': validate && isEmpty( tier.name ),
	} );

	const linkClassNames = className( 'janitorial-state-widget-popover-tier-link', {
		'janitorial-state-widget-popover-tier-link-not-valid': validate && isEmpty( tier.link ),
	} );

	const repositoryClassNames = className( 'janitorial-state-widget-popover-tier-repos', {
		'janitorial-state-widget-popover-tier-repos-not-valid': validate && isEmpty( tier.repos ),
	} );

	const issuesLabelsClassNames = className( 'janitorial-state-widget-popover-tier-issues-label', {
		'janitorial-state-widget-popover-tier-issues-labels-not-valid':
			validate && isEmpty( tier.issuesLabel ),
	} );

	const regClassNames = className( 'janitorial-state-widget-link-fields', {
		'janitorial-state-widget-link-fields-hidden': ! ( tier.regularLink || false ),
	} );

	const ghClassNames = className( 'janitorial-state-widget-link-fields', {
		'janitorial-state-widget-link-fields-hidden': tier.regularLink || false,
	} );

	return (
		<div className="janitorial-state-widget-tier">
			<>
				<TextControl
					label="Link Label"
					className={ labelClassNames }
					value={ tier.name || '' }
					onChange={ onChangeName }
					placeholder={ 'Tier 1 (8 issues)' }
					help={ 'Enter the label you want to display as a link.' }
				/>
				<div className="janitorial-state-widget-toggle">
					<span className="janitorial-state-widget-toggle-label">Use custom link</span>
					<FormToggle checked={ tier.regularLink || false } onChange={ onToggleRegularLink } />
				</div>
				<div ref={ ghLink } className={ ghClassNames }>
					<TextareaControl
						label="GitHub Repository Names"
						className={ repositoryClassNames }
						value={ tier.repos || '' }
						onChange={ onChangeRepos }
						placeholder={ 'woocommerce/woocommerce-bookings' }
						help={
							'Enter the repositories you want to include along with organization or user prefix. (i.e. woocommerce/woocommerce-bookings) One repository per line.'
						}
					/>
					<TextareaControl
						label="Issue Labels"
						className={ issuesLabelsClassNames }
						value={ tier.issuesLabel || '' }
						onChange={ onChangeIssuesLabel }
						placeholder={ '[Type] Bug' }
						help={ 'Enter the issue labels you want to search for. One label per line.' }
					/>
					<SelectControl
						className="janitorial-state-widget-popover-tier-issue-sort-order"
						label="Issues sorting order"
						value={ tier.sortOrder }
						options={ [
							{ label: 'Newest', value: '' },
							{ label: 'Oldest', value: 'sort:created-asc' },
							{ label: 'Recently Updated', value: 'sort:updated-desc' },
							{ label: 'Least Recently Updated', value: 'sort:updated-asc' },
							{ label: 'Most Commented', value: 'sort:comments-desc' },
							{ label: 'Least Commented', value: 'sort:comments-asc' },
						] }
						onChange={ onChangeSortOrder }
					/>
				</div>
				<div ref={ regLink } className={ regClassNames }>
					<TextControl
						label="Link"
						className={ linkClassNames }
						value={ tier.link || '' }
						onChange={ onChangeLink }
						placeholder={ 'https://example.link' }
						help={ 'Enter the link you want to use.' }
					/>
				</div>
			</>
		</div>
	);
};

export default Tier;
