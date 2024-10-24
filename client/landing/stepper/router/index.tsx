import React, { Children, PropsWithChildren, ReactElement, ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import { Primitive } from 'utility-types';

{
	/* <Flow persistParam={['from', 'to', 'siteSlug']}>
	<From step={step} >
		<To step={step} when={hasSite} />
		<To step={step} />
		<BackTo step={step} when={hasSite} />
	</From>

	<From step={step} >
		<To step={step} when={hasSite} />
	</From>
</Flow> */
}

const RouteWithCondition = ( {
	children,
	condition,
}: {
	children: React.ReactNode;
	condition: () => boolean;
} ) => {
	return <div>{ children }</div>;
};

interface FromProps extends React.PropsWithChildren {
	step: string;
}

interface ToProps extends React.PropsWithChildren {
	step: string;
	when?: () => boolean;
}

interface FlowProps {
	name: string;
	persistParam: string[];
	children: React.ReactElement< FromProps >[];
}

type Step = ReactElement< FromProps > | ReactElement< ToProps >;
const extractSteps = ( children: Step[] ) => {
	return Children.map( children, ( child: Step ) => {
		return child.props.step;
	} );
};

export const Flow = ( {
	children,
	name,
	persistParam,
}: {
	children: Step | Step[];
	persistParam: string[];
	name: string;
} ) => {
	return <Routes>{ children }</Routes>;
};

interface INavigation {
	from: string;
	toOptions: {
		step: string;
		when: ( context: IContext ) => boolean;
	}[];
}

export type IContext< P extends Record< string, Primitive > = Record< string, Primitive > > = P;

export const From = ( { children, step }: { children: React.ReactNode; step: string } ) => {
	return <div>From</div>;
};

export const To = ( { step, when }: { step: string; when?: ( context: IContext ) => boolean } ) => {
	return <div>To</div>;
};

export const BackTo = ( {
	step,
	when,
}: {
	step: string;
	when: ( context: IContext ) => boolean;
} ) => {
	return <div>BackTo</div>;
};

const extractNavigation = ( children: ReactElement< FromProps >[] ) => {
	return Children.map< INavigation, ReactElement< FromProps > >(
		children,
		( child: ReactElement< FromProps > ) => {
			return {
				from: child.props.step,
				toOptions: Children.map< INavigation[ 'toOptions' ], ReactElement< ToProps > >(
					child.props.children,
					( child: ReactElement< ToProps > ) => ( {
						step: child.props.step,
						when: child.props.when ?? ( () => true ),
					} )
				),
			};
		}
	);
};

export const createNavigator = < T extends IContext >( node: ReactElement< FlowProps > ) => {
	const { children, name } = node.props;

	const steps = extractSteps( children );
	const navigations = extractNavigation( children );

	return {
		useStepNavigation: ( currentStep: string, navigate: ( path: string ) => void ) => {
			return {
				submit: ( providerDependency: any ) => {
					const context = {
						...providerDependency,
					} as T;

					const navigation = navigations.find( ( nav ) => nav.from === currentStep );
					const to = navigation?.toOptions.find( ( to ) => to.when( context ) );
					if ( to ) {
						navigate( `/${ name }/${ to.step }` );
					}
				},
				goBack: () => {
					navigate( `/${ name }` );
				},
			};
		},
		useSteps: () => {
			return steps;
		},
	};
};
