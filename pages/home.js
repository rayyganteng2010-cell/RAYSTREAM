// pages/home.js
export async function getServerSideProps() {
  // Ambil data dari API atau database
  const response = await fetch('xnxx.com');
  const data = await response.json();

  return { props: { data } };
}

const Home = ({ data }) => {
  return (
    <div>
      <h1>Home Page</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Home;
