import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { init as initStore } from '../panel/state';
import type { RenderOptions } from '@testing-library/react';
import type { ReactNode } from 'react';

export const renderWithProvider = ( ui: ReactNode, options?: RenderOptions ) => {
	return render( <Provider store={ initStore() }>{ ui }</Provider>, options );
};
