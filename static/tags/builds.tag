<gb-builds>
  <ul>
    <virtual each={ build in builds }>
      <gb-build socket={ parent.socket }></gb-build>
    </virtual>
  </ul>

  <script>
    this.socket = io('http://localhost:3000');
    axios.get('http://localhost:3000/api/jobs')
      .then(({ data }) => this.update({ builds: data }));
    this.on('mount', () => axios.post('http://localhost:3000/api/refresh'));
  </script>

  <style scoped>
    :scope ul {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-wrap: wrap;
    }
    :scope li {
      display: block;
      width: 400px;
      height: 250px;
      margin: 12px;
    }
  </style>
</gb-builds>
