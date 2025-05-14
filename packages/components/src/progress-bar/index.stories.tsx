import ProgressBar from '.';

export default { title: 'Unaudited/ProgressBar' };

export const Normal = () => <ProgressBar value={ 33 } />;
export const Colored = () => <ProgressBar color="red" value={ 33 } />;
export const Compact = () => <ProgressBar compact value={ 33 } />;
export const Pulsing = () => <ProgressBar isPulsing value={ 33 } />;
