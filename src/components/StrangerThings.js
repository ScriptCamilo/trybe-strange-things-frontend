import React from 'react';
import CharactersService from '../services/charactersAPI';
import Table from './Table';

const getRealityClass = (hereIsTheUpsideDownWorld) => (
  hereIsTheUpsideDownWorld ? 'upside-down' : 'stranger-things'
);

const strangerThingsConfig = {
  url: process.env.REACT_APP_HAWKINS_URL,
  timeout: +process.env.REACT_APP_HAWKINS_TIMEOUT,
};

const upsideDownConfig = {
  url: process.env.REACT_APP_UPSIDEDOWN_URL,
  timeout: +process.env.REACT_APP_UPSIDEDOWN_TIMEOUT,
};

const charactersService = new CharactersService(strangerThingsConfig);
const charactersUpsideDownService = new CharactersService(upsideDownConfig);

class StrangerThings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hereIsTheUpsideDownWorld: false,
      characterName: '',
      characters: [],
      page: 1,
    };

    this.setCharacters = this.setCharacters.bind(this);

    this.handleInput = this.handleInput.bind(this);
    this.changeRealityClick = this.changeRealityClick.bind(this);

    this.searchClick = this.searchClick.bind(this);
    this.searchCharacter = this.searchCharacter.bind(this);

    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
  }

  async componentDidMount() {
    const characters = await charactersService.getCharacters();
    this.setCharacters(characters.data);
  }

  setCharacters(characters) {
    this.setState({
      characters,
    });
  }

  handleInput(event) {
    this.setState({
      characterName: event.target.value,
    });
  }

  async changeRealityClick() {
    const { hereIsTheUpsideDownWorld } = this.state;
    const service = !hereIsTheUpsideDownWorld
      ? charactersUpsideDownService
      : charactersService;
    const { data } = await service.getCharacters();

    this.setState({
      hereIsTheUpsideDownWorld: !hereIsTheUpsideDownWorld,
      characters: data,
    });
  }

  searchClick() {
    this.setState(
      {
        page: 1,
      },
      this.searchCharacter(1),
    );
  }

  searchCharacter(pages) {
    const { characterName, hereIsTheUpsideDownWorld, page } = this.state;
    const service = hereIsTheUpsideDownWorld
      ? charactersUpsideDownService
      : charactersService;

    const numberOfPages = 10;
    service
      .getCharacters(characterName, pages || page, numberOfPages)
      .then(({ data: characters }) => this.setCharacters(characters));
  }

  nextPage() {
    const { page, characters } = this.state;

    if (!characters.length) return;
    this.setState(
      {
        page: page + 1,
      },
      () => this.searchCharacter(),
    );
  }

  previousPage() {
    const { page } = this.state;
    if (page <= 1) return;

    this.setState(
      {
        page: page - 1,
      },
      () => this.searchCharacter(),
    );
  }

  render() {
    const isDevelopmentMode = process.env.REACT_APP_DEVELOPMENT === 'true';
    const {
      hereIsTheUpsideDownWorld, characterName, characters, page,
    } = this.state;
    return (
      <div
        className={ `reality ${getRealityClass(
          hereIsTheUpsideDownWorld,
        )}` }
      >
        <div className="content strangerfy">
          { isDevelopmentMode ? <h1 className="development">Em desenvolvimento</h1> : '' }
          <div className="change-reality">
            <button type="button" onClick={ this.changeRealityClick }>
              {' '}
              Mudar de Realidade
            </button>
          </div>

          <div>
            <input
              placeholder="Nome do Personagem"
              onChange={ this.handleInput }
              value={ characterName }
            />
            <button type="button" onClick={ this.searchClick }>Pesquisar</button>
          </div>

          <div>
            <Table characters={ characters } />
          </div>

          <div>
            <p>
              Página atual:
              {page}
            </p>
          </div>
          <div>
            <button type="button" onClick={ this.previousPage }>Anterior</button>
            <button type="button" onClick={ this.nextPage }>Próximo</button>
          </div>
        </div>
      </div>
    );
  }
}

export default StrangerThings;
