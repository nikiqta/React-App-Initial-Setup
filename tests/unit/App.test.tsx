import { renderWithProviders } from '../../src/test-utils';
import App from '@/App';

test('renders Hello World', () => {
  const { getByText } = renderWithProviders(<App />);
  expect(getByText('Hello World')).toBeInTheDocument();
});
