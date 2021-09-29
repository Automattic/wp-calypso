import PropTypes from 'prop-types';
import { useState, useEffect, useCallback } from 'react';
import './style.scss';
import { connect } from 'react-redux';
import {
	getPageSlug,
	getProgressStepList,
} from 'calypso/components/domains/connect-domain-step/page-definitions';
import { getSelectedSite } from 'calypso/state/ui/selectors';

function ConnectDomainSteps( {
	baseClassName,
	domain,
	initialPageSlug,
	onSetPage,
	stepsDefinition,
	selectedSite,
	...stepProps
} ) {
	const [ mode, setMode ] = useState( stepsDefinition[ initialPageSlug ].mode );
	const [ step, setStep ] = useState( stepsDefinition[ initialPageSlug ].step );
	const [ pageSlug, setPageSlug ] = useState( initialPageSlug );
	const [ progressStepList, setProgressStepList ] = useState( {} );

	const StepsComponent = stepsDefinition?.[ pageSlug ].component;

	const setPage = useCallback(
		( pageStepSlug ) => {
			setPageSlug( pageStepSlug );
			onSetPage && onSetPage( pageStepSlug );
			setStep( stepsDefinition[ pageStepSlug ].step );
			setMode( stepsDefinition[ pageStepSlug ].mode );
		},
		[ onSetPage, stepsDefinition ]
	);

	const setNextStep = () => {
		const next = stepsDefinition[ pageSlug ]?.next;
		next && setPage( next );
	};

	useEffect( () => {
		setPage( initialPageSlug );
	}, [ initialPageSlug, setPage ] );

	useEffect( () => {
		setPageSlug( getPageSlug( mode, step, stepsDefinition ) );
	}, [ mode, step, stepsDefinition ] );

	useEffect( () => {
		setProgressStepList( getProgressStepList( mode, stepsDefinition ) );
	}, [ mode, stepsDefinition ] );

	return (
		<StepsComponent
			className={ baseClassName }
			domain={ domain }
			step={ step }
			mode={ mode }
			onNextStep={ setNextStep }
			progressStepList={ progressStepList }
			pageSlug={ pageSlug }
			setPage={ setPage }
			{ ...stepProps }
		/>
	);
}

ConnectDomainSteps.propTypes = {
	baseClassName: PropTypes.string.isRequired,
	domain: PropTypes.string.isRequired,
	initialPageSlug: PropTypes.string.isRequired,
	onSetPage: PropTypes.func,
	stepsDefinition: PropTypes.object.isRequired,
	selectedSite: PropTypes.object,
};

export default connect( ( state ) => ( { selectedSite: getSelectedSite( state ) } ) )(
	ConnectDomainSteps
);
