import '@testing-library/jest-dom';

global.crypto.randomUUID = () => 'fake-uuid';
