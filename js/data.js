// Curated Global Catalog for +Cultura
// REAL covers and metadata for Books (Open Library ISBNs), Movies (TMDb official posters) and Series

const DEFAULT_CATALOG = [
  // ================= 📚 LIVROS COM CAPAS REAIS (Open Library ISBNs) =================
  {
    id: "cat_book_1",
    type: "book",
    title: "1984",
    creator: "George Orwell",
    genre: "Ficção Científica",
    genres: ["Ficção Científica", "Distopia", "Clássico"],
    year: 1949,
    pages: 336,
    isbn: "9780451524935",
    cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
    rating: 4.8,
    synopsis: "Winston Smith vive em uma sociedade totalitária sob a vigilância onipresente do Grande Irmão. Trabalhando na alteração de registros no Ministério da Verdade, ele ousa se apaixonar e questionar o Partido dominante.",
    cast: "Winston Smith, Julia, O'Brien",
    tags: ["distopia", "totalitarismo", "filosófico", "vigilância", "clássico", "psicológico"]
  },
  {
    id: "cat_book_2",
    type: "book",
    title: "O Sol é para Todos",
    creator: "Harper Lee",
    genre: "Drama",
    genres: ["Drama", "Clássico", "Justiça"],
    year: 1960,
    pages: 384,
    isbn: "9780061120084",
    cover: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
    rating: 4.9,
    synopsis: "No Alabama dos anos 1930, o advogado Atticus Finch defende um homem negro falsamente acusado de um crime grave. Pelos olhos da jovem Scout, uma narrativa comovente sobre empatia, preconceito e coragem moral.",
    cast: "Scout Finch, Atticus Finch, Jem Finch, Boo Radley",
    tags: ["justiça", "empatia", "sul americano", "infância", "clássico", "emocionante"]
  },
  {
    id: "cat_book_3",
    type: "book",
    title: "Sapiens: Uma Breve História da Humanidade",
    creator: "Yuval Noah Harari",
    genre: "História",
    genres: ["História", "Antropologia", "Filosofia"],
    year: 2014,
    pages: 464,
    isbn: "9780062316097",
    cover: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    rating: 4.8,
    synopsis: "Como uma espécie insignificante de primatas se tornou a governante do planeta Terra? Harari explora a evolução humana desde a Idade da Pedra até as revoluções cognitiva, agrícola e científica.",
    cast: "Homo Sapiens, Neandertais, Revoluções Humanas",
    tags: ["antropologia", "história", "evolução", "ciência", "filosofia", "sociedade"]
  },
  {
    id: "cat_book_4",
    type: "book",
    title: "Duna",
    creator: "Frank Herbert",
    genre: "Ficção Científica",
    genres: ["Ficção Científica", "Aventura", "Filosofia"],
    year: 1965,
    pages: 688,
    isbn: "9780441172719",
    cover: "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
    rating: 4.9,
    synopsis: "Em um futuro distante, o jovem Paul Atreides viaja ao planeta desértico Arrakis, a única fonte da substância mais valiosa do universo: a especiaria melange. Uma obra monumental sobre política, ecologia e messianismo.",
    cast: "Paul Atreides, Dama Jessica, Duque Leto",
    tags: ["espaço", "deserto", "política", "épico", "filosófico", "complexo"]
  },
  {
    id: "cat_book_5",
    type: "book",
    title: "O Hobbit",
    creator: "J.R.R. Tolkien",
    genre: "Fantasia",
    genres: ["Fantasia", "Aventura", "Clássico"],
    year: 1937,
    pages: 320,
    isbn: "9780547928227",
    cover: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
    rating: 4.8,
    synopsis: "Bilbo Bolseiro é um hobbit pacato que aprecia o conforto de sua toca. Sua vida vira de cabeça para baixo quando o mago Gandalf e treze anões o recrutam como ladrão para recuperar o tesouro guardado pelo dragão Smaug.",
    cast: "Bilbo Bolseiro, Gandalf, Thorin Escudo de Carvalho, Smaug",
    tags: ["fantasia", "aventura", "magia", "dragões", "amizade", "terra média"]
  },
  {
    id: "cat_book_6",
    type: "book",
    title: "A Menina que Roubava Livros",
    creator: "Markus Zusak",
    genre: "Drama",
    genres: ["Drama", "Histórico", "Emocionante"],
    year: 2005,
    pages: 480,
    isbn: "9780375842207",
    cover: "https://covers.openlibrary.org/b/isbn/9780375842207-L.jpg",
    rating: 4.8,
    synopsis: "Narrada pela Morte, a história da jovem Liesel Meminger, que encontra consolo e refúgio nos livros que rouba e compartilha enquanto a Alemanha é assolada pelos horrores da Segunda Guerra Mundial.",
    cast: "Liesel Meminger, Hans Hubermann, Rosa Hubermann, Max Vandenburg",
    tags: ["segunda guerra", "livros", "morte", "sensível", "família", "emocionante"]
  },
  {
    id: "cat_book_7",
    type: "book",
    title: "A Revolução dos Bichos",
    creator: "George Orwell",
    genre: "Fábula",
    genres: ["Fábula", "Sátira Política", "Clássico"],
    year: 1945,
    pages: 152,
    isbn: "9780451526342",
    cover: "https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg",
    rating: 4.7,
    synopsis: "Os animais da Granja do Solar rebelam-se contra seus donos humanos para criar uma sociedade igualitária. Com o tempo, os porcos assumem o controle absoluto sob o lema: 'Todos os animais são iguais, mas alguns são mais iguais que outros'.",
    cast: "Napoleão, Bola-de-Neve, Major, Sansão",
    tags: ["política", "sátira", "poder", "alegoria", "clássico", "curto"]
  },
  {
    id: "cat_book_8",
    type: "book",
    title: "O Senhor dos Anéis: A Sociedade do Anel",
    creator: "J.R.R. Tolkien",
    genre: "Fantasia",
    genres: ["Fantasia", "Aventura", "Épico"],
    year: 1954,
    pages: 576,
    isbn: "9780618346257",
    cover: "https://covers.openlibrary.org/b/isbn/9780618346257-L.jpg",
    rating: 4.9,
    synopsis: "Frodo Bolseiro herda o Um Anel, forjado por Sauron para dominar a Terra-média. Acompanhado por magos, homens, elfos e anões, inicia uma perigosa marcha rumo à Montanha da Perdição.",
    cast: "Frodo Bolseiro, Gandalf, Aragorn, Legolas, Gimli",
    tags: ["fantasia", "épico", "amizade", "magia", "aventura", "mitologia"]
  },
  {
    id: "cat_book_9",
    type: "book",
    title: "Torto Arado",
    creator: "Itamar Vieira Junior",
    genre: "Literatura Brasileira",
    genres: ["Literatura Brasileira", "Drama", "Histórico"],
    year: 2019,
    pages: 264,
    isbn: "9786556920405",
    cover: "https://covers.openlibrary.org/b/isbn/9786556920405-L.jpg",
    rating: 4.9,
    synopsis: "Nas profundezas do sertão baiano, as irmãs Bibiana e Belonísia encontram uma misteriosa faca de prata. Um acidente entrelaça seus destinos para sempre, em uma narrativa sobre ancestralidade e resistência.",
    cast: "Bibiana, Belonísia, Donana, Severo",
    tags: ["brasil", "ancestralidade", "sertão", "resistência", "drama", "emocionante"]
  },
  {
    id: "cat_book_10",
    type: "book",
    title: "Cem Anos de Solidão",
    creator: "Gabriel García Márquez",
    genre: "Realismo Mágico",
    genres: ["Realismo Mágico", "Drama", "Clássico"],
    year: 1967,
    pages: 448,
    isbn: "9780060883287",
    cover: "https://covers.openlibrary.org/b/isbn/9780060883287-L.jpg",
    rating: 4.8,
    synopsis: "A monumental saga de sete gerações da família Buendía na mágica aldeia de Macondo. Um clássico universal que funde o cotidiano, o amor e o sobrenatural.",
    cast: "José Arcadio Buendía, Úrsula Iguarán, Aureliano Buendía",
    tags: ["família", "realismo mágico", "tempo", "clássico", "literatura latino-americana"]
  },
  {
    id: "cat_book_11",
    type: "book",
    title: "Fahrenheit 451",
    creator: "Ray Bradbury",
    genre: "Ficção Científica",
    genres: ["Ficção Científica", "Distopia", "Filosofia"],
    year: 1953,
    pages: 216,
    isbn: "9781451673319",
    cover: "https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg",
    rating: 4.7,
    synopsis: "Em um futuro em que a leitura é proibida pelo Estado e os bombeiros têm a função de queimar livros, Guy Montag passa por um despertar de consciência que o coloca em rota de colisão com o regime.",
    cast: "Guy Montag, Clarisse McClellan, Capitão Beatty",
    tags: ["distopia", "livros", "censura", "filosófico", "pensamento crítico"]
  },
  {
    id: "cat_book_12",
    type: "book",
    title: "O Pequeno Príncipe",
    creator: "Antoine de Saint-Exupéry",
    genre: "Fábula",
    genres: ["Fábula", "Filosofia", "Clássico"],
    year: 1943,
    pages: 96,
    isbn: "9780156012195",
    cover: "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg",
    rating: 4.8,
    synopsis: "Um piloto perdido no deserto encontra um garotinho loiro vindo de um asteroide distante. Juntos, refletem sobre amor, solidão, a essência das coisas invisíveis aos olhos e o valor dos laços afetivos.",
    cast: "O Pequeno Príncipe, O Aviador, A Rosa, A Raposa",
    tags: ["filosofia", "poesia", "infância", "curto", "emocionante"]
  },

  // ================= 🎬 FILMES COM PÔSTERES REAIS (TMDb Oficiais) =================
  {
    id: "cat_movie_1",
    type: "movie",
    title: "Interestelar",
    creator: "Christopher Nolan",
    genre: "Ficção Científica",
    genres: ["Ficção Científica", "Drama", "Aventura"],
    year: 2014,
    duration: 169,
    cover: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    rating: 4.9,
    synopsis: "Com os recursos da Terra se esgotando, uma equipe de exploradores viaja através de um buraco de minhoca no espaço em busca de um novo lar para a humanidade.",
    cast: "Matthew McConaughey, Anne Hathaway, Jessica Chastain",
    tags: ["espaço", "tempo", "amor", "física", "emocionante", "trilha sonora"]
  },
  {
    id: "cat_movie_2",
    type: "movie",
    title: "Oppenheimer",
    creator: "Christopher Nolan",
    genre: "Biografia",
    genres: ["Biografia", "Histórico", "Drama"],
    year: 2023,
    duration: 180,
    cover: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    rating: 4.9,
    synopsis: "A trajetória do físico J. Robert Oppenheimer à frente do Projeto Manhattan em Los Alamos e o dilema moral de desenvolver a primeira arma nuclear do mundo.",
    cast: "Cillian Murphy, Emily Blunt, Robert Downey Jr.",
    tags: ["ciência", "guerra", "história", "moralidade", "tensão", "política"]
  },
  {
    id: "cat_movie_3",
    type: "movie",
    title: "Parasita",
    creator: "Bong Joon-ho",
    genre: "Suspense",
    genres: ["Suspense", "Drama", "Comédia Negra"],
    year: 2019,
    duration: 132,
    cover: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    rating: 4.9,
    synopsis: "A humilde família Kim infiltra-se gradualmente no cotidiano de uma família abastada de Seul, até que um acontecimento inesperado desencadeia o caos.",
    cast: "Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong",
    tags: ["desigualdade", "reviravoltas", "tensão", "humor negro", "coreia"]
  },
  {
    id: "cat_movie_4",
    type: "movie",
    title: "Blade Runner 2049",
    creator: "Denis Villeneuve",
    genre: "Ficção Científica",
    genres: ["Ficção Científica", "Neo-Noir", "Mistério"],
    year: 2017,
    duration: 164,
    cover: "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg",
    rating: 4.8,
    synopsis: "O policial K, um replicante caçador de androides, descobre um segredo esquecido há décadas que tem o poder de mergulhar a sociedade no colapso absoluto.",
    cast: "Ryan Gosling, Harrison Ford, Ana de Armas",
    tags: ["cyberpunk", "filosófico", "visual deslumbrante", "identidade", "distopia"]
  },
  {
    id: "cat_movie_5",
    type: "movie",
    title: "Whiplash: Em Busca da Perfeição",
    creator: "Damien Chazelle",
    genre: "Drama",
    genres: ["Drama", "Música", "Psicológico"],
    year: 2014,
    duration: 106,
    cover: "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
    rating: 4.8,
    synopsis: "Um jovem baterista de jazz sonha com a consagração em um renomado conservatório de Nova York, sendo empurrado ao extremo físico e mental por um instrutor impiedoso.",
    cast: "Miles Teller, J.K. Simmons, Paul Reiser",
    tags: ["música", "obsessão", "tensão", "jazz", "atuação marcante"]
  },
  {
    id: "cat_movie_6",
    type: "movie",
    title: "O Poderoso Chefão",
    creator: "Francis Ford Coppola",
    genre: "Drama",
    genres: ["Drama", "Crime", "Máfia"],
    year: 1972,
    duration: 175,
    cover: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    rating: 4.9,
    synopsis: "A crônica da dinastia criminosa da família Corleone quando o filho relutante, Michael, assume o comando dos negócios da família após um atentado contra o patriarca Don Vito.",
    cast: "Marlon Brando, Al Pacino, James Caan",
    tags: ["máfia", "família", "poder", "clássico", "obra-prima", "tensão"]
  },
  {
    id: "cat_movie_7",
    type: "movie",
    title: "A Viagem de Chihiro",
    creator: "Hayao Miyazaki",
    genre: "Animação",
    genres: ["Animação", "Fantasia", "Aventura"],
    year: 2001,
    duration: 125,
    cover: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    rating: 4.9,
    synopsis: "Chihiro entra sem querer no mundo mágico dos espíritos e deuses. Quando seus pais são enfeitiçados, ela precisa trabalhar em uma casa de banhos sobrenatural para resgatá-los.",
    cast: "Rumi Hiiragi, Miyu Irino, Mari Natsuki",
    tags: ["estúdio ghibli", "espíritos", "infância", "poesia visual", "obra-prima"]
  },
  {
    id: "cat_movie_8",
    type: "movie",
    title: "Matrix",
    creator: "Lana e Lilly Wachowski",
    genre: "Ficção Científica",
    genres: ["Ficção Científica", "Ação", "Cyberpunk"],
    year: 1999,
    duration: 136,
    cover: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    rating: 4.9,
    synopsis: "O programador Thomas Anderson descobre que a realidade em que vive é uma ilusão cibernética mantida por máquinas para controlar a humanidade.",
    cast: "Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss",
    tags: ["cyberpunk", "filosofia", "ação", "ia", "revolucionário"]
  },
  {
    id: "cat_movie_9",
    type: "movie",
    title: "Clube da Luta",
    creator: "David Fincher",
    genre: "Suspense",
    genres: ["Suspense", "Drama", "Psicológico"],
    year: 1999,
    duration: 139,
    cover: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    rating: 4.8,
    synopsis: "Um trabalhador insone conhece o vendedor Tyler Durden e juntos fundam um clube clandestino de lutas que evolui para um movimento revolucionário e niilista.",
    cast: "Edward Norton, Brad Pitt, Helena Bonham Carter",
    tags: ["psicológico", "reviravoltas", "anarquia", "cult", "crítica social"]
  },
  {
    id: "cat_movie_10",
    type: "movie",
    title: "Pulp Fiction: Tempo de Violência",
    creator: "Quentin Tarantino",
    genre: "Crime",
    genres: ["Crime", "Comédia Negra", "Drama"],
    year: 1994,
    duration: 154,
    cover: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    rating: 4.8,
    synopsis: "As histórias entrecruzadas de dois assassinos filosóficos, a esposa de um chefão da máfia, um pugilista em apuros e um casal de assaltantes em uma lanchonete.",
    cast: "John Travolta, Samuel L. Jackson, Uma Thurman, Bruce Willis",
    tags: ["diálogos marcantes", "máfia", "cult", "não-linear", "trilha sonora"]
  },
  {
    id: "cat_movie_11",
    type: "movie",
    title: "Duna: Parte 2",
    creator: "Denis Villeneuve",
    genre: "Ficção Científica",
    genres: ["Ficção Científica", "Aventura", "Guerra"],
    year: 2024,
    duration: 166,
    cover: "https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGzyAiIHQw9h.jpg",
    rating: 4.9,
    synopsis: "Paul Atreides se une a Chani e aos Fremen em busca de vingança contra os conspiradores que destruíram sua família, enfrentando o dilema entre o amor e o destino do universo.",
    cast: "Timothée Chalamet, Zendaya, Rebecca Ferguson, Austin Butler",
    tags: ["épico", "deserto", "guerra", "profecia", "ficção científica"]
  },
  {
    id: "cat_movie_12",
    type: "movie",
    title: "Cidade de Deus",
    creator: "Fernando Meirelles",
    genre: "Drama",
    genres: ["Drama", "Crime", "Nacional"],
    year: 2002,
    duration: 130,
    cover: "https://image.tmdb.org/t/p/w500/k7eYdWvhYQ7RQo9OB8fZY428FeW.jpg",
    rating: 4.9,
    synopsis: "Nas favelas do Rio de Janeiro entre os anos 60 e 80, dois jovens seguem caminhos opostos: um busca se tornar fotógrafo e o outro ascende como o mais temido traficante da região.",
    cast: "Alexandre Rodrigues, Leandro Firmino, Seu Jorge, Alice Braga",
    tags: ["brasil", "cinema nacional", "favela", "fotografia", "obra-prima"]
  },

  // ================= 📺 SÉRIES COM PÔSTERES REAIS (TMDb Oficiais) =================
  {
    id: "cat_series_1",
    type: "series",
    title: "Breaking Bad",
    creator: "Vince Gilligan",
    genre: "Drama",
    genres: ["Drama", "Crime", "Suspense"],
    year: 2008,
    seasons: 5,
    episodes: 62,
    cover: "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    rating: 5.0,
    synopsis: "Diagnosticado com câncer terminal, um professor de química do ensino médio junta-se a um ex-aluno para cozinhar e vender metanfetamina, tornando-se o impiedoso Heisenberg.",
    cast: "Bryan Cranston, Aaron Paul, Anna Gunn, Giancarlo Esposito",
    tags: ["crime", "transformação", "drogas", "tensão", "obra-prima", "complexo"]
  },
  {
    id: "cat_series_2",
    type: "series",
    title: "Dark",
    creator: "Baran bo Odar",
    genre: "Ficção Científica",
    genres: ["Ficção Científica", "Mistério", "Suspense"],
    year: 2017,
    seasons: 3,
    episodes: 26,
    cover: "https://image.tmdb.org/t/p/w500/apbrkMDHHcHv7Flss3q5DCc3vL7.jpg",
    rating: 4.9,
    synopsis: "O desaparecimento de duas crianças em uma cidadezinha alemã revela as complexas conexões temporais e segredos de quatro famílias ao longo de três gerações.",
    cast: "Louis Hofmann, Oliver Masucci, Jördis Triebel",
    tags: ["viagem no tempo", "paradoxos", "mistério", "complexo", "alemão", "filosófico"]
  },
  {
    id: "cat_series_3",
    type: "series",
    title: "Succession",
    creator: "Jesse Armstrong",
    genre: "Drama",
    genres: ["Drama", "Comédia Negra", "Corporativo"],
    year: 2018,
    seasons: 4,
    episodes: 39,
    cover: "https://image.tmdb.org/t/p/w500/7HXag6t1zKz26iXfT2mJ9U7V38f.jpg",
    rating: 4.9,
    synopsis: "A disputa impiedosa pelo poder entre os quatro filhos do patriarca Logan Roy quando sua saúde declina e a liderança de seu conglomerado global de mídia fica em aberto.",
    cast: "Brian Cox, Jeremy Strong, Sarah Snook, Kieran Culkin",
    tags: ["família", "poder", "riqueza", "traição", "diálogos brilhantes"]
  },
  {
    id: "cat_series_4",
    type: "series",
    title: "Severance (Ruptura)",
    creator: "Dan Erickson",
    genre: "Suspense",
    genres: ["Suspense", "Ficção Científica", "Mistério"],
    year: 2022,
    seasons: 2,
    episodes: 19,
    cover: "https://image.tmdb.org/t/p/w500/4n74v43yE6q1y3bHqf1b0aV7xL5.jpg",
    rating: 4.9,
    synopsis: "Mark lidera uma equipe de funcionários de escritório cujas memórias foram cirurgicamente divididas entre sua vida pessoal e a profissional na misteriosa Lumon Industries.",
    cast: "Adam Scott, Patricia Arquette, John Turturro, Christopher Walken",
    tags: ["distopia", "trabalho", "mistério", "psicológico", "original"]
  },
  {
    id: "cat_series_5",
    type: "series",
    title: "The Last of Us",
    creator: "Craig Mazin",
    genre: "Drama",
    genres: ["Drama", "Pós-apocalíptico", "Ação"],
    year: 2023,
    seasons: 1,
    episodes: 9,
    cover: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2V7J9AhP.jpg",
    rating: 4.9,
    synopsis: "Vinte anos após uma infecção fúngica destruir a sociedade moderna, o sobrevivente Joel é contratado para contrabandear Ellie, uma jovem imune de 14 anos, através dos Estados Unidos.",
    cast: "Pedro Pascal, Bella Ramsey, Gabriel Luna",
    tags: ["apocalipse", "afeto", "sobrevivência", "emocionante", "games"]
  },
  {
    id: "cat_series_6",
    type: "series",
    title: "Arcane",
    creator: "Christian Linke",
    genre: "Animação",
    genres: ["Animação", "Fantasia", "Ação"],
    year: 2021,
    seasons: 2,
    episodes: 18,
    cover: "https://image.tmdb.org/t/p/w500/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
    rating: 4.9,
    synopsis: "Em meio às tensões entre a próspera cidade utópica de Piltover e os subterrâneos oprimidos de Zaun, duas irmãs órfãs lutam em lados opostos de uma guerra de magias tecnológicas.",
    cast: "Hailee Steinfeld, Ella Purnell, Kevin Alejandro",
    tags: ["animação deslumbrante", "irmãs", "steampunk", "tragédia", "obra-prima"]
  },
  {
    id: "cat_series_7",
    type: "series",
    title: "Stranger Things",
    creator: "Os Irmãos Duffer",
    genre: "Ficção Científica",
    genres: ["Ficção Científica", "Terror", "Aventura"],
    year: 2016,
    seasons: 4,
    episodes: 34,
    cover: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    rating: 4.8,
    synopsis: "Na pacata Hawkins dos anos 1980, o desaparecimento de um garoto leva amigos e familiares a desvendarem segredos do governo, forças sobrenaturais e uma garota com poderes telecinéticos.",
    cast: "Millie Bobby Brown, Finn Wolfhard, Winona Ryder, David Harbour",
    tags: ["anos 80", "nostalgia", "amizade", "monstros", "aventura"]
  },
  {
    id: "cat_series_8",
    type: "series",
    title: "O Gambito da Rainha",
    creator: "Scott Frank",
    genre: "Drama",
    genres: ["Drama", "Esporte", "Histórico"],
    year: 2020,
    seasons: 1,
    episodes: 7,
    cover: "https://image.tmdb.org/t/p/w500/zU0htwkhNvBQdVSIKB9s6hgVeFK.jpg",
    rating: 4.8,
    synopsis: "Em um orfanato dos anos 1950, uma menina prodígio do xadrez luta contra o vício e os preconceitos para conquistar o topo do campeonato mundial.",
    cast: "Anya Taylor-Joy, Bill Camp, Marielle Heller",
    tags: ["xadrez", "superação", "anos 60", "estilo", "minissérie"]
  },
  {
    id: "cat_series_9",
    type: "series",
    title: "Mindhunter",
    creator: "David Fincher",
    genre: "Suspense",
    genres: ["Suspense", "Crime", "Psicológico"],
    year: 2017,
    seasons: 2,
    episodes: 19,
    cover: "https://image.tmdb.org/t/p/w500/fbKE87mojpIETWepSbD5875x2Zu.jpg",
    rating: 4.8,
    synopsis: "No fim dos anos 1970, dois agentes do FBI inauguram a moderna psicologia criminal entrevistando assassinos em série aprisionados para desvendar crimes em andamento.",
    cast: "Jonathan Groff, Holt McCallany, Anna Torv",
    tags: ["psicologia", "serial killers", "fbi", "tensão", "investigação"]
  },
  {
    id: "cat_series_10",
    type: "series",
    title: "Sherlock",
    creator: "Steven Moffat e Mark Gatiss",
    genre: "Mistério",
    genres: ["Mistério", "Crime", "Drama"],
    year: 2010,
    seasons: 4,
    episodes: 13,
    cover: "https://image.tmdb.org/t/p/w500/7WTsnHsqUIqjKV0ly9VUmUknQm5.jpg",
    rating: 4.8,
    synopsis: "Uma releitura contemporânea e inteligente do detetive consultor Sherlock Holmes e seu companheiro médico veterano Dr. John Watson na Londres do século XXI.",
    cast: "Benedict Cumberbatch, Martin Freeman, Andrew Scott",
    tags: ["detetive", "inteligência", "londres", "dedução", "humor"]
  }
];

// Elegant editorial book placeholder if an external image fails to load
function getFallbackCoverSvg(title, type) {
  const icon = type === 'book' ? '📖' : type === 'movie' ? '🎬' : '📺';
  const cleanTitle = (title || 'Cultura').replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c]));
  const displayTitle = cleanTitle.length > 22 ? cleanTitle.substring(0, 20) + '...' : cleanTitle;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
    <defs>
      <linearGradient id="editorialGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#173B57"/>
        <stop offset="100%" stop-color="#0F283C"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#editorialGrad)"/>
    <rect x="20" y="20" width="360" height="560" fill="none" stroke="#F28C28" stroke-width="2" stroke-opacity="0.3" rx="8"/>
    <rect x="30" y="30" width="340" height="540" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-opacity="0.1" rx="6"/>
    
    <text x="200" y="200" font-size="54" text-anchor="middle">${icon}</text>
    
    <line x1="80" y1="260" x2="320" y2="260" stroke="#F28C28" stroke-width="2" stroke-linecap="round"/>
    
    <text x="200" y="330" font-family="Playfair Display, Georgia, serif" font-size="24" font-weight="700" fill="#FFFFFF" text-anchor="middle">${displayTitle}</text>
    <text x="200" y="380" font-family="Plus Jakarta Sans, sans-serif" font-size="12" font-weight="600" letter-spacing="3" fill="#F28C28" text-anchor="middle">+CULTURA</text>
    <text x="200" y="410" font-family="Plus Jakarta Sans, sans-serif" font-size="11" fill="#CBD5E1" text-anchor="middle">EDIÇÃO DIGITAL</text>
  </svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/'/g, '%27');
}

// Live External Search Integration for OpenLibrary (Books), iTunes (Movies) & TVMaze (Series)
const SearchService = {
  _cache: new Map(),

  async searchBooksOpenLibrary(query) {
    if (!query || query.trim().length < 2) return [];
    const cacheKey = `book_${query.trim().toLowerCase()}`;
    if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=8`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const results = (data.docs || []).map(doc => {
        const coverId = doc.cover_i;
        const isbn = doc.isbn ? doc.isbn[0] : null;
        const coverUrl = coverId 
          ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
          : isbn 
          ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
          : getFallbackCoverSvg(doc.title, 'book');

        const genres = Array.isArray(doc.subject) && doc.subject.length > 0 
          ? doc.subject.slice(0, 3) 
          : ['Literatura'];

        return {
          id: `ol_${(doc.key || '').replace('/works/', '') || Date.now()}`,
          type: 'book',
          title: doc.title || 'Sem título',
          creator: doc.author_name ? doc.author_name[0] : 'Autor desconhecido',
          genre: genres[0],
          genres: genres,
          year: doc.first_publish_year || new Date().getFullYear(),
          pages: doc.number_of_pages_median || (doc.number_of_pages ? doc.number_of_pages[0] : 320),
          isbn: isbn || '',
          publisher: doc.publisher ? doc.publisher[0] : '',
          cover: coverUrl,
          rating: 4.8,
          synopsis: `Obra do acervo Open Library. Primeira publicação registrada em ${doc.first_publish_year || 'edição clássica'}.`,
          tags: genres.map(g => g.toLowerCase())
        };
      });

      this._cache.set(cacheKey, results);
      return results;
    } catch (e) {
      console.warn('Open Library search fallback', e);
      return [];
    }
  },

  async searchMoviesItunes(query) {
    if (!query || query.trim().length < 2) return [];
    const cacheKey = `movie_${query.trim().toLowerCase()}`;
    if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=movie&limit=8`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const results = (data.results || []).map(item => ({
        id: `itunes_${item.trackId}`,
        type: 'movie',
        title: item.trackName || 'Sem título',
        creator: item.artistName || 'Diretor aclamado',
        genre: item.primaryGenreName || 'Cinema',
        genres: [item.primaryGenreName || 'Cinema'],
        year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : 2020,
        duration: Math.round((item.trackTimeMillis || 7200000) / 60000),
        cover: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb') || getFallbackCoverSvg(item.trackName, 'movie'),
        rating: 4.8,
        synopsis: item.longDescription || item.shortDescription || 'Produção cinematográfica de destaque.',
        tags: [item.primaryGenreName || 'Cinema', 'filme']
      }));

      this._cache.set(cacheKey, results);
      return results;
    } catch (e) {
      console.warn('iTunes search fallback', e);
      return [];
    }
  },

  async searchSeriesTVMaze(query) {
    if (!query || query.trim().length < 2) return [];
    const cacheKey = `series_${query.trim().toLowerCase()}`;
    if (this._cache.has(cacheKey)) return this._cache.get(cacheKey);

    try {
      const url = `https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const results = (data || []).slice(0, 8).map(entry => {
        const show = entry.show || {};
        const year = show.premiered ? new Date(show.premiered).getFullYear() : 2021;
        const genres = Array.isArray(show.genres) && show.genres.length > 0 ? show.genres : ['Drama'];
        const cover = (show.image && (show.image.original || show.image.medium)) 
          ? (show.image.original || show.image.medium) 
          : getFallbackCoverSvg(show.name, 'series');
        
        // Clean summary tags
        const cleanSummary = (show.summary || '').replace(/<[^>]*>?/gm, '').trim();

        // Estimate seasons and episodes based on show status/type
        let seasons = 1;
        let episodes = 10;
        if (show.status === 'Ended') {
          seasons = 3;
          episodes = 28;
        }

        const creator = (show.network && show.network.name) || 
                        (show.webChannel && show.webChannel.name) || 
                        'Showrunner Cultural';

        return {
          id: `tvmaze_${show.id}`,
          type: 'series',
          title: show.name || 'Sem título',
          creator: creator,
          genre: genres[0],
          genres: genres,
          year: year,
          seasons: seasons,
          episodes: episodes,
          cover: cover,
          rating: show.rating && show.rating.average ? Math.min(5, (show.rating.average / 2)).toFixed(1) : 4.8,
          synopsis: cleanSummary || 'Série aclamada com narrativa instigante.',
          tags: genres.map(g => g.toLowerCase())
        };
      });

      this._cache.set(cacheKey, results);
      return results;
    } catch (e) {
      console.warn('TVMaze search fallback', e);
      return [];
    }
  },

  async searchAll(query) {
    if (!query || query.trim().length < 2) return { books: [], movies: [], series: [] };
    const [books, movies, series] = await Promise.all([
      this.searchBooksOpenLibrary(query),
      this.searchMoviesItunes(query),
      this.searchSeriesTVMaze(query)
    ]);
    return { books, movies, series };
  }
};

// 16 Avatares Editoriais Culturais Estilizados (Vetores SVG Puros e Acolhedores)
const EDITORIAL_AVATARS = [
  { id: 'av_leitor', name: 'Leitor Voraz', icon: '📖', bg: '#173B57', accent: '#F28C28', text: 'LEITOR' },
  { id: 'av_cinefilo', name: 'Cinéfilo Clássico', icon: '🎬', bg: '#0E273C', accent: '#F59E0B', text: 'CINEMA' },
  { id: 'av_escritora', name: 'Escritora Criativa', icon: '✒️', bg: '#3E8E75', accent: '#FAF6EE', text: 'AUTORA' },
  { id: 'av_filosofo', name: 'Filósofo Reflexivo', icon: '🏛️', bg: '#2C3E50', accent: '#E6DCCD', text: 'PENSAR' },
  { id: 'av_maratona', name: 'Maratonista Séries', icon: '📺', bg: '#F28C28', accent: '#173B57', text: 'SÉRIES' },
  { id: 'av_critico', name: 'Crítico Cultural', icon: '🧐', bg: '#4A6572', accent: '#FDF3E7', text: 'CRÍTICA' },
  { id: 'av_poeta', name: 'Poeta Romântico', icon: '📜', bg: '#8D6E63', accent: '#F59E0B', text: 'POESIA' },
  { id: 'av_diretora', name: 'Diretora de Arte', icon: '🎥', bg: '#1B3B4B', accent: '#F28C28', text: 'DIREÇÃO' },
  { id: 'av_explorador', name: 'Ficção & Cosmos', icon: '🪐', bg: '#122538', accent: '#3E8E75', text: 'SCI-FI' },
  { id: 'av_arte', name: 'Amante das Artes', icon: '🎨', bg: '#D9534F', accent: '#FAF6EE', text: 'ARTES' },
  { id: 'av_fantasia', name: 'Mundo Fantástico', icon: '🐉', bg: '#28536B', accent: '#F59E0B', text: 'FANTASIA' },
  { id: 'av_dramaturgo', name: 'Dramaturgo', icon: '🎭', bg: '#34495E', accent: '#E74C3C', text: 'TEATRO' },
  { id: 'av_historiador', name: 'Historiador', icon: '⏳', bg: '#5D4037', accent: '#FFE0B2', text: 'HISTÓRIA' },
  { id: 'av_musico', name: 'Trilha Sonora', icon: '🎻', bg: '#2E4053', accent: '#F28C28', text: 'MÚSICA' },
  { id: 'av_cafe', name: 'Café & Leituras', icon: '☕', bg: '#6F4E37', accent: '#FFF8DC', text: 'CAFÉ' },
  { id: 'av_enxadrista', name: 'Estrategista', icon: '♟️', bg: '#173B57', accent: '#3E8E75', text: 'ESTRATÉGIA' }
].map(item => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
    <defs>
      <linearGradient id="grad_${item.id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${item.bg}"/>
        <stop offset="100%" stop-color="#091825"/>
      </linearGradient>
    </defs>
    <rect width="160" height="160" rx="80" fill="url(#grad_${item.id})"/>
    <circle cx="80" cy="80" r="74" fill="none" stroke="${item.accent}" stroke-width="3" stroke-opacity="0.45"/>
    <circle cx="80" cy="80" r="70" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-opacity="0.2"/>
    <text x="80" y="88" font-size="52" text-anchor="middle" dominant-baseline="middle">${item.icon}</text>
    <rect x="36" y="122" width="88" height="20" rx="10" fill="#FAF6EE" fill-opacity="0.95"/>
    <text x="80" y="136" font-family="Plus Jakarta Sans, sans-serif" font-size="9" font-weight="800" letter-spacing="1.5" fill="${item.bg}" text-anchor="middle">${item.text}</text>
  </svg>`;
  return {
    ...item,
    url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg).replace(/'/g, '%27')
  };
});

